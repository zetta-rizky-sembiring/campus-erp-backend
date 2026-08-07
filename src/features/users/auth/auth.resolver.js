// *************** IMPORT MODULE ***************
const { LoginSchema, ValidateInput } = require('./auth.validator');
const { LoginHelper } = require('./auth.helper');

// *************** IMPORT UTILITIES ***************
const { NormalizeGqlError } = require('../../../shared/utils/normalize_gql_error');

// *************** MUTATION ***************
/**
 * Authenticate a user and return a JWT.
 *
 * @param {null} _ Parent resolver value.
 * @param {{ input: { email: string, password: string } }} args Login mutation arguments.
 * @returns {Promise<string>} JWT access token.
 */
async function Login(_, { input }) {
  try {
    // ***************Validate login input payload.
    const payload = ValidateInput(LoginSchema, input);

    // ***************Authenticate user and generate JWT.
    return await LoginHelper(payload);
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  Login,
};
