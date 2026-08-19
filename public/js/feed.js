// feed.js

const composeModal = document.getElementById('compose-modal');
const openComposeBtn = document.getElementById('open-compose');
const closeComposeBtn = document.getElementById('close-compose');

const composeForm = document.getElementById('compose-form');
const composeError = document.getElementById('compose-error');
const composeStatus = document.getElementById('compose-status');
const fileInput = document.getElementById('compose-image');
const fileNameLabel = document.getElementById('compose-file-name');
const feedContainer = document.getElementById('feed-container');
const emptyState = document.getElementById('empty-state');

const commentsModal = document.getElementById('comments-modal');
const closeCommentsBtn = document.getElementById('close-comments');
const commentsList = document.getElementById('comments-list');
const commentForm = document.getElementById('comment-form');
const commentInput = document.getElementById('comment-input');
const commentStatus = document.getElementById('comment-status');

let activePostId = null;
let activePostType = null;

requireSession().then((user) => {
  if (!user) return;
  loadFeed();
});

// ---------- compose modal ----------

openComposeBtn.addEventListener('click', () => composeModal.classList.remove('hidden'));
closeComposeBtn.addEventListener('click', () => composeModal.classList.add('hidden'));
composeModal.addEventListener('click', (e) => {
  if (e.target === composeModal) composeModal.classList.add('hidden');
});

fileInput.addEventListener('change', () => {
  fileNameLabel.textContent = fileInput.files[0]?.name || 'Choose an image';
});

composeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  composeError.textContent = '';
  composeStatus.textContent = '';
  composeStatus.removeAttribute('data-state');

  if (!fileInput.files[0]) {
    composeError.textContent = 'Choose an image to post.';
    return;
  }

  const submitBtn = composeForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  composeStatus.textContent = 'Posting…';

  const formData = new FormData();
  formData.append('image', fileInput.files[0]);
  formData.append('caption', document.getElementById('compose-caption').value);

  try {
    const res = await fetch('/api/posts', { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not create that post.');

    composeForm.reset();
    fileNameLabel.textContent = 'Choose an image';
    composeStatus.textContent = 'Posted!';
    composeStatus.dataset.state = 'ok';
    composeModal.classList.add('hidden');
    loadFeed();
  } catch (err) {
    composeStatus.textContent = err.message || 'Something went wrong. Try again.';
    composeStatus.dataset.state = 'error';
  } finally {
    submitBtn.disabled = false;
  }
});

// ---------- comments modal ----------

closeCommentsBtn.addEventListener('click', () => commentsModal.classList.add('hidden'));
commentsModal.addEventListener('click', (e) => {
  if (e.target === commentsModal) commentsModal.classList.add('hidden');
});

async function openComments(postId, postType) {
  activePostId = postId;
  activePostType = postType;
  commentStatus.textContent = '';
  commentInput.value = '';
  commentsList.innerHTML = '<p class="status-line">Loading…</p>';
  commentsModal.classList.remove('hidden');

  try {
    const res = await fetch(`/api/comments?postId=${encodeURIComponent(postId)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not load comments.');
    renderComments(data.comments);
  } catch (err) {
    commentsList.innerHTML = `<p class="status-line" data-state="error">${err.message}</p>`;
  }
}

function renderComments(comments) {
  commentsList.innerHTML = '';
  if (!comments.length) {
    commentsList.innerHTML = '<p class="status-line">No comments yet.</p>';
    return;
  }
  for (const c of comments) {
    const row = document.createElement('div');
    row.className = 'comment-row';

    const avatar = document.createElement('div');
    avatar.className = 'avatar-initial';
    avatar.textContent = c.username.charAt(0);
    row.appendChild(avatar);

    const text = document.createElement('span');
    text.className = 'comment-text';
    const usernameEl = document.createElement('span');
    usernameEl.className = 'post-card-username';
    usernameEl.textContent = c.username;
    text.appendChild(usernameEl);
    text.appendChild(document.createTextNode(' ' + c.body));
    row.appendChild(text);

    commentsList.appendChild(row);
  }
}

commentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = commentInput.value.trim();
  if (!body || !activePostId) return;

  commentStatus.textContent = 'Posting…';
  commentStatus.removeAttribute('data-state');

  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: activePostId, postType: activePostType, body }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not post that comment.');

    commentInput.value = '';
    commentStatus.textContent = '';
    openComments(activePostId, activePostType);
    bumpCommentCount(activePostId, 1);
  } catch (err) {
    commentStatus.textContent = err.message;
    commentStatus.dataset.state = 'error';
  }
});

function bumpCommentCount(postId, delta) {
  const el = document.querySelector(`.post-card[data-post-id="${postId}"] .comment-count-link`);
  if (!el) return;
  const current = Number(el.dataset.count || 0) + delta;
  el.dataset.count = current;
  el.textContent = current > 0 ? `View all ${current} comments` : '';
}

// ---------- feed ----------

async function loadFeed() {
  try {
    const res = await fetch('/api/posts');
    if (!res.ok) throw new Error('Could not load the feed.');
    const data = await res.json();
    renderPosts(data.posts);
  } catch (err) {
    console.error('loadFeed error:', err);
  }
}

function renderPosts(posts) {
  feedContainer.querySelectorAll('.post-card').forEach((el) => el.remove());

  if (!posts.length) {
    emptyState.style.display = '';
    return;
  }
  emptyState.style.display = 'none';

  for (const post of posts) {
    feedContainer.appendChild(buildPostCard(post));
  }
}

function buildPostCard(post) {
  const card = document.createElement('article');
  card.className = 'post-card';
  card.dataset.postId = post.id;
  card.dataset.postType = post.post_type;

  const header = document.createElement('div');
  header.className = 'post-card-header';

  const avatar = document.createElement('div');
  avatar.className = 'avatar-initial';
  avatar.textContent = post.username.charAt(0);
  header.appendChild(avatar);

  const headerUsername = document.createElement('span');
  headerUsername.className = 'post-card-username';
  headerUsername.textContent = post.username;
  header.appendChild(headerUsername);

  const more = document.createElement('span');
  more.className = 'post-card-more';
  more.textContent = '\u2022\u2022\u2022';
  header.appendChild(more);

  card.appendChild(header);

    let media;
  if (post.media_type === 'video') {
    media = document.createElement('video');
    media.src = post.image_url;
    media.className = 'post-media';
    media.controls = true;
    media.muted = true;
    media.loop = true;
    media.playsInline = true;
    media.autoplay = true;
  } else {
    media = document.createElement('img');
    media.src = post.image_url;
    media.alt = post.caption || `Post by ${post.username}`;
    media.loading = 'lazy';
    media.className = 'post-media';
  }
  card.appendChild(media);


  const actions = document.createElement('div');
  actions.className = 'post-card-actions';

  const likeBtn = document.createElement('button');
  likeBtn.type = 'button';
  likeBtn.className = 'icon-btn like-btn';
  likeBtn.setAttribute('aria-label', 'Like');
  likeBtn.style.opacity = '0.85';
  if (post.liked_by_me) likeBtn.classList.add('liked');
  likeBtn.innerHTML = heartSvg();
  likeBtn.addEventListener('click', () => toggleLike(post.id, post.post_type, likeBtn, card));
  actions.appendChild(likeBtn);

  const commentBtn = document.createElement('button');
  commentBtn.type = 'button';
  commentBtn.className = 'icon-btn';
  commentBtn.setAttribute('aria-label', 'Comment');
  commentBtn.style.opacity = '0.85';
  commentBtn.innerHTML = commentSvg();
  commentBtn.addEventListener('click', () => openComments(post.id, post.post_type));
  actions.appendChild(commentBtn);

  const shareIcon = document.createElement('span');
  shareIcon.className = 'icon-btn';
  shareIcon.style.opacity = '0.85';
  shareIcon.style.cursor = 'default';
  shareIcon.setAttribute('aria-hidden', 'true');
  shareIcon.innerHTML = shareSvg();
  actions.appendChild(shareIcon);

  const spacer = document.createElement('span');
  spacer.className = 'spacer';
  actions.appendChild(spacer);

  const saveIcon = document.createElement('span');
  saveIcon.className = 'icon-btn';
  saveIcon.style.opacity = '0.85';
  saveIcon.style.cursor = 'default';
  saveIcon.setAttribute('aria-hidden', 'true');
  saveIcon.innerHTML = saveSvg();
  actions.appendChild(saveIcon);

  card.appendChild(actions);

  const likeCountEl = document.createElement('p');
  likeCountEl.className = 'post-card-likes';
  likeCountEl.textContent = post.like_count > 0 ? formatLikeCount(post.like_count) : '';
  card.appendChild(likeCountEl);

  const body = document.createElement('div');
  body.className = 'post-card-body';

  const username = document.createElement('span');
  username.className = 'post-card-username';
  username.textContent = post.username;
  body.appendChild(username);

  if (post.caption) {
    const caption = document.createElement('span');
    caption.className = 'post-card-caption';
    caption.textContent = post.caption;
    body.appendChild(caption);
  }

  card.appendChild(body);

  const commentLink = document.createElement('button');
  commentLink.type = 'button';
  commentLink.className = 'comment-count-link';
  commentLink.dataset.count = post.comment_count;
  commentLink.textContent = post.comment_count > 0 ? `View all ${post.comment_count} comments` : '';
  commentLink.addEventListener('click', () => openComments(post.id, post.post_type));
  card.appendChild(commentLink);

  const time = document.createElement('time');
  time.className = 'post-card-time';
  time.textContent = new Date(post.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  card.appendChild(time);

  return card;
}

async function toggleLike(postId, postType, likeBtn, card) {
  likeBtn.disabled = true;
  try {
    const res = await fetch('/api/likes/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, postType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not update like.');

    likeBtn.classList.toggle('liked', data.liked);

    const likeCountEl = card.querySelector('.post-card-likes');
    const current = Number(likeCountEl.dataset.count || 0);
    const next = data.liked ? current + 1 : Math.max(0, current - 1);
    likeCountEl.dataset.count = next;
    likeCountEl.textContent = next > 0 ? formatLikeCount(next) : '';
  } catch (err) {
    console.error('toggleLike error:', err);
  } finally {
    likeBtn.disabled = false;
  }
}

function formatLikeCount(n) {
  return `${n} ${n === 1 ? 'like' : 'likes'}`;
}

function heartSvg() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>`;
}

function commentSvg() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>`;
}

function shareSvg() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" />
  </svg>`;
}

function saveSvg() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>`;
}
