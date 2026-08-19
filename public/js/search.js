// search.js

const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('search-results');

let debounceTimer = null;

requireSession().then((user) => {
  if (!user) return;
});

searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const q = searchInput.value.trim();
  if (!q) {
    resultsContainer.innerHTML = '';
    return;
  }
  debounceTimer = setTimeout(() => runSearch(q), 300);
});

async function runSearch(q) {
  try {
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    renderResults(data.users || []);
  } catch (err) {
    console.error('search error:', err);
  }
}

function renderResults(users) {
  resultsContainer.innerHTML = '';

  if (!users.length) {
    resultsContainer.innerHTML = '<p class="status-line">No users found.</p>';
    return;
  }

  for (const u of users) {
    resultsContainer.appendChild(buildResultRow(u));
  }
}

function buildResultRow(user) {
  const row = document.createElement('div');
  row.className = 'search-row';

  const avatar = document.createElement('div');
  if (user.profile_picture) {
    avatar.className = 'avatar-initial';
    avatar.style.padding = '0';
    const img = document.createElement('img');
    img.src = user.profile_picture;
    img.alt = '';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '50%';
    avatar.appendChild(img);
  } else {
    avatar.className = 'avatar-initial';
    avatar.textContent = user.username.charAt(0);
  }
  row.appendChild(avatar);

  const info = document.createElement('div');
  info.className = 'search-info';

  const username = document.createElement('p');
  username.className = 'search-username';
  username.textContent = user.username;
  info.appendChild(username);

  if (user.bio) {
    const bio = document.createElement('p');
    bio.className = 'search-bio';
    bio.textContent = user.bio;
    info.appendChild(bio);
  }

  row.appendChild(info);

  const followBtn = document.createElement('button');
  followBtn.type = 'button';
  followBtn.className = 'btn follow-btn';
  setFollowButtonState(followBtn, user.following);
  followBtn.addEventListener('click', () => toggleFollow(user.username, followBtn));
  row.appendChild(followBtn);

  return row;
}

function setFollowButtonState(btn, following) {
  btn.textContent = following ? 'Following' : 'Follow';
  btn.classList.toggle('btn-outline', following);
}

async function toggleFollow(username, btn) {
  btn.disabled = true;
  try {
    const res = await fetch(`/api/follows/${encodeURIComponent(username)}/toggle`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not update follow status.');
    setFollowButtonState(btn, data.following);
  } catch (err) {
    console.error('toggleFollow error:', err);
  } finally {
    btn.disabled = false;
  }
}
