// *************** IMPORT MODULE ***************
const { SubmitTestGradesSchema } = require('./grading.validator');
const { SubmitTestGradesHelper } = require('./grading.helper');
const { AppError } = require('../../../core/error');
const ValidateInput = require('../../../shared/validators/validate_input_with_joi');

//*************** IMPORT UTILITIES ***************
const { NormalizeGqlError } = require('../../../shared/utils/normalize_gql_error');

// *************** MUTATION ***************
/**
 *
 * @param {*} _ - GraphQL parent resolver.
 * @param {Object} args - GraphQL mutation arguments.
 * @returns {Promise<Object>} Inserted StudentTestGrade documents.
 */
async function SubmitTestGrades(_, { id, input }) {
  try {
    const payload = ValidateInput(SubmitTestGradesSchema, input);

    return await SubmitTestGradesHelper(payload);
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  SubmitTestGrades,
};
