exports.organizerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'organizer') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied: organizer role required' });
};

exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied: admin role required' });
};

exports.organizerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'organizer' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ error: 'Access denied: organizer or admin role required' });
};
