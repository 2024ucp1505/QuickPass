const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET environment variable is not set.');
  process.exit(1);
}

/**
 * Generate a signed JWT for the given user payload.
 * @param {Object} payload - { id, role }
 * @returns {string} signed JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Verify a JWT token and return decoded payload.
 * @param {string} token
 * @returns {Object} decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
