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

        // *************** START: Validate mutation payload ***************
        const payload = ValidateInput(CreateEnrollmentSchema, input);
        // *************** END: Validate mutation payload ***************


        // *************** START: Execute enrollment workflow ***************
        return await EnrollStudentHelper(
            payload.student_id,
            payload.academic_year_id
        );
        // *************** END: Execute enrollment workflow ***************

    } catch (error) {
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

        // *************** START: Validate mutation payload ***************
        const payload = ValidateInput(CreateEnrollmentSchema, input);
        // *************** END: Validate mutation payload ***************


        // *************** START: Execute batch enrollment workflow ***************
        return await EnrollStudentsHelper(payload);
        // *************** END: Execute batch enrollment workflow ***************

    } catch (error) {
        throw NormalizeGqlError(error);
    }
}

// *************** EXPORT MODULE ***************
module.exports = {
    EnrollStudent,
    EnrollStudentsToYear,
};