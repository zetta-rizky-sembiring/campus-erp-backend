// *************** IMPORT MODULE ***************
const { LoginSchema, ValidateInput } = require('./auth.validator');
const { LoginHelper } = require('./auth.helper');

/**
 * Authenticate a user and return a JWT.
 *
 * @param {null} _ Parent resolver value.
 * @param {{ input: { email: string, password: string } }} args Login mutation arguments.
 * @returns {Promise<string>} JWT access token.
 */
async function Login(_, { input }) {
  return LoginHelper(input);
}

// *************** EXPORT MODULE ***************
module.exports = {
  Login,
};
