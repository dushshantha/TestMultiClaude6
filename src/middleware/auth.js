const jwt = require('jsonwebtoken');

/**
 * Creates a signed JWT token.
 * @param {object} payload - Data to encode in the token
 * @param {string} [secret] - JWT secret (defaults to process.env.JWT_SECRET)
 * @param {string} [expiresIn='1h'] - Token expiry (e.g. '1h', '24h', '7d')
 * @returns {string} Signed JWT token
 */
function createToken(payload, secret, expiresIn = '1h') {
  const signingSecret = secret || process.env.JWT_SECRET;
  return jwt.sign(payload, signingSecret, { expiresIn });
}

/**
 * Express middleware that validates a JWT Bearer token from the Authorization header.
 * On success, attaches the decoded payload to req.user and calls next().
 * On failure, responds with 401 and a JSON error message.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid token format. Use: Bearer <token>' });
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authenticate, createToken };
