// *************** IMPORT MODULE ***************
const config = require('../../core/config');

// *************** IMPORT LIBRARY ***************
const jwt = require('jsonwebtoken');

/**
 * Authenticate request using JWT from the Authorization header.
 *
 * If the token is valid, the decoded payload is attached to `req.user`.
 * Otherwise, `req.user` is set to `undefined`.
 *
 * @param {import('express').Request} req Express request object.
 * @param {import('express').Response} res Express response object.
 * @param {import('express').NextFunction} next Express next middleware.
 */
function AuthMiddleware(req, res, next) {
  const authHeader = req.headers?.authorization || '';

  // ***************Skip authentication if Authorization header is missing or invalid.
  if (!authHeader.startsWith('Bearer ')) {
    req.user = undefined;
    return next();
  }

  const token = authHeader.slice(7).trim();

  try {
    // ***************Verify JWT and attach the decoded payload to the request.
    req.user = jwt.verify(token, config.jwt.secret);
  } catch (error) {
    req.user = undefined;
  }

  next();
}

// *************** EXPORT MODULE ***************
module.exports = AuthMiddleware;
