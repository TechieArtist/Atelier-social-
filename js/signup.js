// signup.js — client-side only for now.
// Once the Express backend exists, replace the fetch stub below with a
// real POST to /api/signup and redirect to feed.html on success.

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
  if (username.length < 3) {
    errorNote.textContent = 'Username must be at least 3 characters.';
    return;
  }
  if (!isValidEmail(email)) {
    errorNote.textContent = 'That email address doesn\'t look right.';
    return;
  }
  if (password.length < 8) {
    errorNote.textContent = 'Password must be at least 8 characters.';
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
    // Placeholder for the real request:
    // const res = await fetch('/api/signup', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ username, email, password })
    // });
    // if (!res.ok) throw new Error('Could not create that account.');
    // window.location.href = 'feed.html';

    await new Promise((resolve) => setTimeout(resolve, 400));
    statusLine.textContent = 'Backend not connected yet — this will create your account once the server is ready.';
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
