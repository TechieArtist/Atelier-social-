// admin.js

requireSession().then((user) => {
  if (!user) return;
  loadRatio();
  loadPersonas();
});

const slider = document.getElementById('ratio-slider');
const ratioValue = document.getElementById('ratio-value');
const ratioStatus = document.getElementById('ratio-status');

slider.addEventListener('input', () => {
  ratioValue.textContent = `${slider.value}% real / ${100 - slider.value}% AI`;
});

async function loadRatio() {
  try {
    const res = await fetch('/api/feed-settings');
    const data = await res.json();
    slider.value = data.realPercent;
    ratioValue.textContent = `${data.realPercent}% real / ${100 - data.realPercent}% AI`;
  } catch (err) {
    console.error('loadRatio error:', err);
  }
}

document.getElementById('ratio-save').addEventListener('click', async () => {
  ratioStatus.textContent = 'Saving…';
  ratioStatus.removeAttribute('data-state');
  try {
    const res = await fetch('/api/feed-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ realPercent: Number(slider.value) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save.');
    ratioStatus.textContent = 'Saved.';
    ratioStatus.dataset.state = 'ok';
  } catch (err) {
    ratioStatus.textContent = err.message;
    ratioStatus.dataset.state = 'error';
  }
});

const personaList = document.getElementById('persona-list');

async function loadPersonas() {
  try {
    const res = await fetch('/api/admin/personas');
    const data = await res.json();
    renderPersonas(data.personas || []);
  } catch (err) {
    console.error('loadPersonas error:', err);
  }
}

function renderPersonas(personas) {
  personaList.innerHTML = '';
  if (!personas.length) {
    personaList.innerHTML = '<p class="status-line">No personas yet.</p>';
    return;
  }
  for (const p of personas) {
    const row = document.createElement('div');
    row.className = 'search-row';
    row.style.cursor = 'pointer';

    const avatar = document.createElement('div');
    avatar.className = 'avatar-initial';
    if (p.profile_picture) {
      avatar.style.padding = '0';
      const img = document.createElement('img');
      img.src = p.profile_picture;
      img.alt = '';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '50%';
      avatar.appendChild(img);
    } else {
      avatar.textContent = p.username.charAt(0);
    }
    row.appendChild(avatar);

    const info = document.createElement('div');
    info.className = 'search-info';
    const username = document.createElement('p');
    username.className = 'search-username';
    username.textContent = p.username;
    info.appendChild(username);
    if (p.persona_tag) {
      const tag = document.createElement('p');
      tag.className = 'search-bio';
      tag.textContent = p.persona_tag;
      info.appendChild(tag);
    }
    row.appendChild(info);

    row.addEventListener('click', () => openPersonaModal(p));
    personaList.appendChild(row);
  }
}

const personaModal = document.getElementById('persona-modal');
const personaModalTitle = document.getElementById('persona-modal-title');
const closePersonaModalBtn = document.getElementById('close-persona-modal');
const newPersonaBtn = document.getElementById('new-persona-btn');

const personaForm = document.getElementById('persona-form');
const personaIdField = document.getElementById('persona-id');
const personaUsernameField = document.getElementById('persona-username');
const personaTagField = document.getElementById('persona-tag');
const personaBioField = document.getElementById('persona-bio');
const personaError = document.getElementById('persona-error');
const personaStatus = document.getElementById('persona-status');

const personaAvatarInput = document.getElementById('persona-avatar-input');
const personaAvatarImg = document.getElementById('persona-avatar-img');
const personaAvatarPlaceholder = document.getElementById('persona-avatar-placeholder');
const personaAvatarStatus = document.getElementById('persona-avatar-status');

const personaPostForm = document.getElementById('persona-post-form');
const personaPostFileInput = document.getElementById('persona-post-image');
const personaPostFileName = document.getElementById('persona-post-file-name');
const personaPostError = document.getElementById('persona-post-error');
const personaPostStatus = document.getElementById('persona-post-status');

newPersonaBtn.addEventListener('click', () => openPersonaModal(null));
closePersonaModalBtn.addEventListener('click', () => personaModal.classList.add('hidden'));
personaModal.addEventListener('click', (e) => {
  if (e.target === personaModal) personaModal.classList.add('hidden');
});

function openPersonaModal(persona) {
  personaError.textContent = '';
  personaStatus.textContent = '';
  personaPostError.textContent = '';
  personaPostStatus.textContent = '';
  personaAvatarStatus.textContent = '';
  personaPostForm.reset();
  personaPostFileName.textContent = 'Choose an image or video';

  const isNew = !persona;
  personaModalTitle.textContent = isNew ? 'New persona' : 'Edit persona';
  personaIdField.value = isNew ? '' : persona.id;
  personaUsernameField.value = isNew ? '' : persona.username;
  personaTagField.value = isNew ? '' : (persona.persona_tag || '');
  personaBioField.value = isNew ? '' : (persona.bio || '');

  setPersonaAvatarPreview(isNew ? null : persona.profile_picture);

  personaPostForm.style.display = isNew ? 'none' : '';
  document.getElementById('persona-avatar').style.pointerEvents = isNew ? 'none' : '';
  document.getElementById('persona-avatar').style.opacity = isNew ? '0.5' : '';

  personaModal.classList.remove('hidden');
}

function setPersonaAvatarPreview(url) {
  if (url) {
    personaAvatarImg.src = url;
    personaAvatarImg.style.display = '';
    personaAvatarPlaceholder.style.display = 'none';
  } else {
    personaAvatarImg.style.display = 'none';
    personaAvatarPlaceholder.style.display = '';
  }
}

personaForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  personaError.textContent = '';
  personaStatus.textContent = '';
  personaStatus.removeAttribute('data-state');

  const username = personaUsernameField.value.trim();
  if (!username) {
    personaError.textContent = 'Username is required.';
    return;
  }

  const id = personaIdField.value;
  const isNew = !id;
  const submitBtn = personaForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  personaStatus.textContent = 'Saving…';

  const payload = {
    username,
    personaTag: personaTagField.value.trim(),
    bio: personaBioField.value.trim(),
  };

  try {
    const res = await fetch(isNew ? '/api/admin/personas' : `/api/admin/personas/${id}`, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not save that persona.');

    personaStatus.textContent = 'Saved.';
    personaStatus.dataset.state = 'ok';
    loadPersonas();

    if (isNew) {
      openPersonaModal(data.persona);
    }
  } catch (err) {
    personaStatus.textContent = err.message;
    personaStatus.dataset.state = 'error';
  } finally {
    submitBtn.disabled = false;
  }
});

personaAvatarInput.addEventListener('change', async () => {
  const file = personaAvatarInput.files[0];
  const id = personaIdField.value;
  if (!file || !id) return;

  personaAvatarStatus.textContent = 'Uploading…';
  personaAvatarStatus.removeAttribute('data-state');

  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const res = await fetch(`/api/admin/personas/${id}/avatar`, { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not upload photo.');

    setPersonaAvatarPreview(data.persona.profile_picture);
    personaAvatarStatus.textContent = 'Updated.';
    personaAvatarStatus.dataset.state = 'ok';
    loadPersonas();
  } catch (err) {
    personaAvatarStatus.textContent = err.message;
    personaAvatarStatus.dataset.state = 'error';
  }
});

personaPostFileInput.addEventListener('change', () => {
  personaPostFileName.textContent = personaPostFileInput.files[0]?.name || 'Choose an image or video';
});

personaPostForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  personaPostError.textContent = '';
  personaPostStatus.textContent = '';
  personaPostStatus.removeAttribute('data-state');

  const id = personaIdField.value;
  if (!id) return;
  if (!personaPostFileInput.files[0]) {
    personaPostError.textContent = 'Choose an image or video.';
    return;
  }

  const submitBtn = personaPostForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  personaPostStatus.textContent = 'Posting…';

  const formData = new FormData();
  formData.append('image', personaPostFileInput.files[0]);
  formData.append('caption', document.getElementById('persona-post-caption').value);

  try {
    const res = await fetch(`/api/admin/personas/${id}/posts`, { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not create that post.');

    personaPostForm.reset();
    personaPostFileName.textContent = 'Choose an image or video';
    personaPostStatus.textContent = 'Posted!';
    personaPostStatus.dataset.state = 'ok';
  } catch (err) {
    personaPostStatus.textContent = err.message;
    personaPostStatus.dataset.state = 'error';
  } finally {
    submitBtn.disabled = false;
  }
});
