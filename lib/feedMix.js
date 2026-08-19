// lib/feedMix.js

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function mixFeed(realPosts, aiPosts, realPercent, total = 30) {
  let realCount = Math.min(Math.round((total * realPercent) / 100), realPosts.length);
  let aiCount = Math.min(total - realCount, aiPosts.length);

  let remaining = total - realCount - aiCount;
  if (remaining > 0) {
    const extraReal = Math.min(remaining, realPosts.length - realCount);
    realCount += extraReal;
    remaining -= extraReal;
  }
  if (remaining > 0) {
    const extraAi = Math.min(remaining, aiPosts.length - aiCount);
    aiCount += extraAi;
    remaining -= extraAi;
  }

  const tokens = shuffle([
    ...Array(realCount).fill('R'),
    ...Array(aiCount).fill('A'),
  ]);

  let ri = 0;
  let ai = 0;
  return tokens.map((t) => (t === 'R' ? realPosts[ri++] : aiPosts[ai++]));
}

module.exports = { mixFeed };
