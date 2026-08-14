// middleware/auth.js
// Drop this in front of any route that should only work for a logged-in
// user, e.g.  router.get('/feed', requireAuth, feedController.list)

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not logged in.' });
  }
  next();
}

module.exports = { requireAuth };
