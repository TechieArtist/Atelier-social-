// login.js — client-side only for now.
// Once the Express backend exists, replace the fetch stub below with a
// real POST to /api/login and redirect to feed.html on success.

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
  if (!isValidEmail(email)) {
    errorNote.textContent = 'That email address doesn\'t look right.';
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  statusLine.textContent = 'Logging in…';

  try {
    // Placeholder for the real request:
    // const res = await fetch('/api/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // });
    // if (!res.ok) throw new Error('Invalid email or password.');
    // window.location.href = 'feed.html';

    await new Promise((resolve) => setTimeout(resolve, 400));
    statusLine.textContent = 'Backend not connected yet — this will log you in once the server is ready.';
    statusLine.dataset.state = 'ok';
  } catch (err) {
    statusLine.textContent = err.message || 'Something went wrong. Try again.';
    statusLine.dataset.state = 'error';
  } finally {
    submitBtn.disabled = false;
  }
});

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
