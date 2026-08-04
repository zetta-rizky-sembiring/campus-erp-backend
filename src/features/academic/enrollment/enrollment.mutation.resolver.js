// *************** IMPORT MODULE ***************
const { AcademicYear } = require('./academic_year.model');
const { ObjectIdHexSchema, CreateEnrollmentSchema, UpdateEnrollmentSchema, ValidateInput } = require('./enrollment.validator');
const { EnrollStudentHelper, EnrollStudentsHelper } = require('./enrollment.helper');
const { AppError } = require('../../../core/error');

// *************** IMPORT UTILITIES ***************
const { NormalizeGqlError } = require('../../../shared/utils/normalize_gql_error');

// *************** MUTATION ***************

/**
 * Enrolls a single student into an academic year.
 *
 * @param {*} _ - GraphQL parent resolver.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {Object} args.input - Enrollment payload.
 * @returns {Promise<Object>} Updated academic year document.
 */
async function EnrollStudent(_, { input }) {
  try {
    // *************** Validate enrollment payload ***************
    const payload = ValidateInput(CreateEnrollmentSchema, input);

    // *************** Execute single student enrollment workflow ***************
    return await EnrollStudentHelper(payload.student_id, payload.academic_year_id);
  } catch (error) {
    // *************** Normalize and forward enrollment errors ***************
    throw NormalizeGqlError(error);
  }
}

/**
 * Enrolls multiple students into an academic year.
 *
 * @param {*} _ - GraphQL parent resolver.
 * @param {Object} args - GraphQL mutation arguments.
 * @param {Object} args.input - Batch enrollment payload.
 * @returns {Promise<Object>} Updated academic year document.
 */
async function EnrollStudentsToYear(_, { input }) {
  try {
    // *************** Validate batch enrollment payload ***************
    const payload = ValidateInput(CreateEnrollmentSchema, input);

    // *************** Execute bulk enrollment workflow ***************
    return await EnrollStudentsHelper(payload);
  } catch (error) {
    // *************** Normalize and forward batch enrollment errors ***************
    throw NormalizeGqlError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  EnrollStudent,
  EnrollStudentsToYear,
};
