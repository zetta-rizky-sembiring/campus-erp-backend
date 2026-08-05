// *************** IMPORT MODULE ***************
const { GetAllStudentsHelper, GetStudentsByAcademicYearHelper } = require('./student.helper');

// *************** IMPORT VALIDATOR ***************
const { GetStudentsByAcademicYearSchema, ValidateInput } = require('./student.validator');

// *************** IMPORT UTILITIES ***************
const { NormalizeGqlError } = require('../../../shared/utils/normalize_gql_error');

// *************** QUERY ***************
/**
 * Retrieves all student records.
 *
 * @returns {Promise<Array>} List of all student documents.
 */
async function GetAllStudents() {
  try {
    return await GetAllStudentsHelper();
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

/**
 * Retrieves students enrolled in a specific academic year.
 *
 * @param {Object} _ - GraphQL parent resolver (not used).
 * @param {Object} args - GraphQL arguments containing the input payload.
 * @returns {Promise<Object>}
 */
async function GetStudentsByAcademicYear(_, args) {
  try {
    const payload = ValidateInput(GetStudentsByAcademicYearSchema, args && args.input ? args.input : args);

    return await GetStudentsByAcademicYearHelper(payload);
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  GetAllStudents,
  GetStudentsByAcademicYear,
};
