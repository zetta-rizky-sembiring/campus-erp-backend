// *************** IMPORT MODELS ***************
const { AcademicYearModel } = require('./academic_year.model');
const { StudentModel } = require('../../users/student/student.model');
const { AppError } = require('../../../core/error');

// *************** IMPORT UTILITIES ***************
const { NormalizeObjectId } = require('../../../shared/utils/normalize_object_id');

// *************** MUTATION ***************

/**
 * Enrolls one or more students into an active academic year and
 * synchronizes the relationship on both academic year and student documents.
 *
 * @param {Object} input - Enrollment payload.
 * @param {String} input.academic_year_id - Target academic year identifier.
 * @param {String[]} input.student_ids - Student identifiers to enroll.
 * @returns {Promise<Object>} Updated academic year document.
 * @throws {AppError} 404 - Academic year not found.
 * @throws {AppError} 400 - Academic year is closed or student reference is invalid.
 */
async function EnrollStudentsHelper(input) {

    // *************** START: Normalize incoming identifiers ***************
    const academicYearId = NormalizeObjectId(input.academic_year_id);
    const studentIds = (input.student_ids || []).map((id) => NormalizeObjectId(id));
    // *************** END: Normalize incoming identifiers ***************


    // *************** START: Validate enrollment target ***************
    const academicYear = await AcademicYearModel.findById(academicYearId);

    if (!academicYear) {
        throw new AppError('Academic year not found', 'NOT_FOUND', 404);
    }

    if (academicYear.status !== 'active') {
        throw new AppError(
            'Academic year is closed to new enrollments',
            'ACADEMIC_YEAR_CLOSED',
            400
        );
    }
    // *************** END: Validate enrollment target ***************


    // *************** START: Validate student references ***************
    const matchedStudentCount = await StudentModel.countDocuments({
        _id: { $in: studentIds },
    });

    if (matchedStudentCount !== studentIds.length) {
        throw new AppError(
            'Invalid or deleted student reference(s)',
            'INVALID_STUDENT_REFERENCE',
            400
        );
    }
    // *************** END: Validate student references ***************


    // *************** START: Synchronize enrollment relationship ***************

    // *************** Register students under the academic year document
    const updatedYear = await AcademicYearModel.findByIdAndUpdate(
        academicYearId,
        {
            $addToSet: {
                student_ids: {
                    $each: studentIds,
                },
            },
        },
        { new: true }
    );

    // *************** Also updates each student's academic_year_ids reference
    await StudentModel.updateMany(
        {
            _id: { $in: studentIds },
        },
        {
            $addToSet: {
                academic_year_ids: academicYearId,
            },
        }
    );

    // *************** END: Synchronize enrollment relationship ***************

    return updatedYear;
}

/**
 * Enrolls a single student into an academic year.
 *
 * @param {String} student_id - Student identifier.
 * @param {String} academic_year_id - Target academic year identifier.
 * @returns {Promise<Object>} Updated academic year document.
 * @throws {AppError} Propagates validation and enrollment errors from EnrollStudentsHelper.
 */
async function EnrollStudentHelper(student_id, academic_year_id) {

    // *************** Delegate single enrollment through the batch enrollment workflow
    const input = {
        academic_year_id,
        student_ids: [student_id],
    };

    return await EnrollStudentsHelper(input);
}

// *************** EXPORT MODULE ***************
module.exports = {
    EnrollStudentHelper,
    EnrollStudentsHelper,
};