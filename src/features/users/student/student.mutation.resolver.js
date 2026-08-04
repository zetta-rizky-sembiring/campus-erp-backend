// *************** IMPORT MODULE ***************
const { StudentModel } = require('./student.model');
const { ValidateInput, CreateStudentSchema } = require('./student.validator');
const { CreateStudentHelper } = require('./student.helper');
const { AppError } = require('../../../core/error');

//*************** IMPORT UTILITIES ***************
const { NormalizeGqlError } = require('../../../shared/utils/normalize_gql_error');

// *************** MUTATION ***************

/**
 * Creates a new student record.
 *
 * @param {*} _ - GraphQL parent resolver.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {Object} args.input - Student creation payload.
 * @returns {Promise<Object>} Newly created student document.
 */
async function CreateStudent(_, { input }) {
  try {
    // *************** START: Validate mutation payload ***************
    const payload = ValidateInput(CreateStudentSchema, input);
    // *************** END: Validate mutation payload ***************

    // *************** START: Execute student creation workflow ***************
    return await CreateStudentHelper(payload);
    // *************** END: Execute student creation workflow ***************
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

//*************** EXPORT MODULE ***************
module.exports = {
  CreateStudent,
};
