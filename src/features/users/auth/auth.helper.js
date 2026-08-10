// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// *************** IMPORT MODULE ***************
const { UserModel } = require('../user.model');
const { AppError } = require('../../../core/error');
const config = require('../../../core/config');
const { LoginSchema } = require('./auth.validator');
const ValidateInput = require('../../../shared/validators/validate_input_with_joi');

const JWT_SECRET = config.jwt.secret;

// *************** START: LoginHelper ***************
/**
 * Authenticate a user using email and password, then generate a JWT.
 *
 * @param {{ email: string, password: string }} payload Login credentials.
 * @returns {Promise<string>} Signed JWT access token.
 * @throws {AppError} If the email is not found or the password is invalid.
 */
async function LoginHelper(payload) {
  const input = ValidateInput(LoginSchema, payload);
  const { email, password } = input;

  // ***************Find user by email
  const user = await UserModel.findOne({ email }).lean();
  if (!user) {
    throw new AppError('Invalid email or password', 'UNAUTHORIZED', 401);
  }

  // ***************Compare password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError('Invalid email or password', 'UNAUTHORIZED', 401);
  }

  // ***************Generate JWT token
  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  return token;
}
// *************** END: LoginHelper ***************

// *************** EXPORT MODULE ***************
module.exports = {
  LoginHelper,
};
