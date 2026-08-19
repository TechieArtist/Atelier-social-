// signup.js

const form = document.getElementById('signup-form');
const errorNote = document.getElementById('form-error');
const statusLine = document.getElementById('status-line');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorNote.textContent = '';
  statusLine.textContent = '';
  statusLine.removeAttribute('data-state');

  const username = form.username.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const confirmPassword = form['confirm-password'].value;

  if (!username || !email || !password || !confirmPassword) {
    errorNote.textContent = 'Fill in every field to continue.';
    return;
  }
  if (password !== confirmPassword) {
    errorNote.textContent = 'Passwords don\'t match.';
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  statusLine.textContent = 'Creating account…';

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Could not create that account.');
    }

    statusLine.textContent = 'Account created — redirecting…';
    statusLine.dataset.state = 'ok';
    window.location.href = 'feed.html';
  } catch (err) {
    statusLine.textContent = err.message || 'Something went wrong. Try again.';
    statusLine.dataset.state = 'error';
  } finally {
    submitBtn.disabled = false;
  }
});
