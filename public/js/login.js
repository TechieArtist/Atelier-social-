// login.js

const form = document.getElementById('login-form');
const errorNote = document.getElementById('form-error');
const statusLine = document.getElementById('status-line');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorNote.textContent = '';
  statusLine.textContent = '';
  statusLine.removeAttribute('data-state');

  const email = form.email.value.trim();
  const password = form.password.value;

  if (!email || !password) {
    errorNote.textContent = 'Enter your email and password.';
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  statusLine.textContent = 'Logging in…';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Invalid email or password.');
    }

    statusLine.textContent = 'Success — redirecting…';
    statusLine.dataset.state = 'ok';
    window.location.href = 'feed.html';
  } catch (err) {
    statusLine.textContent = err.message || 'Something went wrong. Try again.';
    statusLine.dataset.state = 'error';
  } finally {
    submitBtn.disabled = false;
  }
});
