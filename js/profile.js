// profile.js — placeholder until real profile data exists.
// Once the backend exists, replace this stub with:
//
// async function loadProfile() {
//   const res = await fetch('/api/profile/me');
//   const profile = await res.json();
//   renderProfile(profile);
// }
// loadProfile();

function renderProfile(profile) {
  document.getElementById('username').textContent = profile.username;
  document.getElementById('display-name').textContent = profile.displayName;
  document.getElementById('bio-text').textContent = profile.bio || 'No bio yet.';
  document.getElementById('bio-text').classList.toggle('placeholder', !profile.bio);
  document.getElementById('post-count').textContent = profile.postCount ?? 0;
  document.getElementById('follower-count').textContent = profile.followerCount ?? 0;
  document.getElementById('following-count').textContent = profile.followingCount ?? 0;
}

// Temporary stand-in data so the page isn't blank while the backend is built.
renderProfile({
  username: 'username',
  displayName: 'Display Name',
  bio: '',
  postCount: 0,
  followerCount: 0,
  followingCount: 0,
});
