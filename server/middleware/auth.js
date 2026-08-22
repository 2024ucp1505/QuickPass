const { verifyToken } = require('../utils/jwt');

/**
 * Middleware to protect routes — validates Bearer JWT.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};

/**
 * Middleware to restrict access to specific roles.
 * @param {...string} roles - allowed roles (e.g., 'teacher', 'student')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: This route requires one of the following roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
