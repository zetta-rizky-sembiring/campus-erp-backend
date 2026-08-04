// *************** IMPORT MODULE ***************
const { StudentModel } = require('./student.model');
const { GetAllStudentsHelper } = require('./student.helper');

//*************** IMPORT UTILITIES ***************
const { NormalizeGqlError } = require('../../../shared/utils/normalize_gql_error');

// *************** QUERY ***************
/**
 * Retrieves all student records.
 * @returns {Promise<Array>} List of all student documents.
 */
async function GetAllStudents() {
  try {
    return await GetAllStudentsHelper();
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  GetAllStudents,
};
