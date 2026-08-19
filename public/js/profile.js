// profile.js

const avatarInput = document.getElementById('avatar-input');
const avatarImg = document.getElementById('avatar-img');
const avatarPlaceholder = document.getElementById('avatar-placeholder');
const avatarStatus = document.getElementById('avatar-status');

const editForm = document.getElementById('edit-form');
const editError = document.getElementById('edit-error');
const editStatus = document.getElementById('edit-status');

requireSession().then((user) => {
  if (!user) return;
  renderProfile(user);
});

function renderProfile(user) {
  document.getElementById('username').textContent = user.username;
  document.getElementById('post-count').textContent = 0;
  document.getElementById('follower-count').textContent = user.followers ?? 0;
  document.getElementById('following-count').textContent = user.following ?? 0;
  loadFollowCounts();
  document.getElementById('edit-username').value = user.username;
  document.getElementById('edit-bio').value = user.bio || '';

  setAvatar(user.profile_picture);
}

function setAvatar(url) {
  if (url) {
    avatarImg.src = url;
    avatarImg.style.display = '';
    avatarPlaceholder.style.display = 'none';
  } else {
    avatarImg.style.display = 'none';
    avatarPlaceholder.style.display = '';
  }
}

avatarInput.addEventListener('change', async () => {
  const file = avatarInput.files[0];
  if (!file) return;

  avatarStatus.textContent = 'Uploading…';
  avatarStatus.removeAttribute('data-state');

  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not upload photo.');

    setAvatar(data.user.profile_picture);
    avatarStatus.textContent = 'Updated.';
    avatarStatus.dataset.state = 'ok';
  } catch (err) {
    avatarStatus.textContent = err.message;
    avatarStatus.dataset.state = 'error';
  }
});

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  editError.textContent = '';
  editStatus.textContent = '';
  editStatus.removeAttribute('data-state');

  const username = document.getElementById('edit-username').value.trim();
  const bio = document.getElementById('edit-bio').value.trim();

  if (!username) {
    editError.textContent = 'Username is required.';
    return;
  }

  const submitBtn = editForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  editStatus.textContent = 'Saving…';

  try {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, bio }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save profile.');

    document.getElementById('username').textContent = data.user.username;
    editStatus.textContent = 'Saved.';
    editStatus.dataset.state = 'ok';
  } catch (err) {
    editStatus.textContent = err.message;
    editStatus.dataset.state = 'error';
  } finally {
    submitBtn.disabled = false;
  }
});



async function loadFollowCounts() {
  try {
    const res = await fetch('/api/follows/me/counts');
    if (!res.ok) return;
    const data = await res.json();
    document.getElementById('follower-count').textContent = data.followers;
    document.getElementById('following-count').textContent = data.following;
  } catch (err) {
    console.error('loadFollowCounts error:', err);
  }
}
