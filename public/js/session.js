// session.js — include on any page that requires a logged-in user.

async function requireSession() {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) {
      window.location.href = 'login.html';
      return null;
    }
    const data = await res.json();
    return data.user;
  } catch (err) {
    console.error('Session check failed:', err);
    window.location.href = 'login.html';
    return null;
  }
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = 'login.html';
}

document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-logout]');
  if (trigger) {
    e.preventDefault();
    logout();
  }
});
