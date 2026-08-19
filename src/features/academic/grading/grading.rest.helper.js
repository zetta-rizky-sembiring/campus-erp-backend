// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODULE ***************
const { StudentModel } = require('../../users/student/student.model');
const { AcademicYearModel } = require('../enrollment/academic_year.model');
const { AcademicStandingModel } = require('./academic_standing.model');
const { AppError, ERROR_CODES } = require('../../../core/error');

// *************** IMPORT UTILITIES ***************
const { NormalizeObjectId } = require('../../../shared/utils/normalize_object_id');

/**
 * Assemble the full report card dataset for a student in a given academic year.
 *
 * Fetches the student profile, the academic year, and every computed academic
 * standing (with block, subject, and test names resolved), then reshapes the
 * documents into the exact structure consumed by the report_card.hbs template.
 *
 * @param {Object} params - Input parameters.
 * @param {String} params.academicYearId - Academic year identifier.
 * @param {String} params.studentId - Student identifier.
 * @returns {Promise<Object>} Template-ready data:
 *   { student, academic_year, standings: [{ block_name, block_average,
 *     block_status, subjects: [{ subject_name, subject_average,
 *     subject_status, tests: [{ test_name, total_mark, test_status }] }] }] }
 */
async function BuildReportCardDataHelper({ academicYearId, studentId }) {
  // *************** Rule 1 - Validate identifiers before any query
  const academicYearObjectId = NormalizeObjectId(academicYearId);
  const studentObjectId = NormalizeObjectId(studentId);

  if (!mongoose.Types.ObjectId.isValid(academicYearObjectId)) {
    throw new AppError('Invalid academic year identifier', ERROR_CODES.INVALID_OBJECT_ID, 400);
  }

  if (!mongoose.Types.ObjectId.isValid(studentObjectId)) {
    throw new AppError('Invalid student identifier', ERROR_CODES.INVALID_OBJECT_ID, 400);
  }

  // *************** Rule 2 - Fetch the student profile
  const student = await StudentModel.findById(studentObjectId).lean();

  if (!student) {
    throw new AppError('Student not found', ERROR_CODES.STUDENT_NOT_FOUND, 404);
  }

  // *************** Rule 3 - Fetch the academic year for the report header
  const academicYear = await AcademicYearModel.findById(academicYearObjectId).lean();

  if (!academicYear) {
    throw new AppError('Academic year not found', ERROR_CODES.ACADEMIC_YEAR_NOT_FOUND, 404);
  }

  // *************** Rule 4 - Fetch all standings and resolve block/subject/test names
  const standings = await AcademicStandingModel.find({
    student_id: studentObjectId,
    academic_year_id: academicYearObjectId,
  })
    .populate([
      { path: 'block_id', select: 'name' },
      { path: 'subjects.subject_id', select: 'name' },
      { path: 'subjects.tests.test_id', select: 'name' },
    ])
    .lean();

  if (standings.length === 0) {
    throw new AppError('Academic standing not found', ERROR_CODES.ACADEMIC_STANDING_NOT_FOUND, 404);
  }

  // *************** Rule 5 - Reshape the documents for the Handlebars template
  const templateData = {
    student: {
      first_name: student.first_name,
      last_name: student.last_name,
      student_number: student.student_number,
    },
    academic_year: {
      name: academicYear.name,
    },
    standings: standings.map((standing) => ({
      block_name: standing.block_id ? standing.block_id.name : 'Unknown Block',
      block_average: standing.block_average,
      block_status: standing.block_status,
      subjects: (standing.subjects || []).map((subject) => ({
        subject_name: subject.subject_id ? subject.subject_id.name : 'Unknown Subject',
        subject_average: subject.subject_average,
        subject_status: subject.subject_status,
        tests: (subject.tests || []).map((test) => ({
          test_name: test.test_id ? test.test_id.name : 'Unknown Test',
          total_mark: test.total_mark,
          test_status: test.test_status,
        })),
      })),
    })),
  };

  return templateData;
}

// *************** EXPORT MODULE ***************
module.exports = {
  BuildReportCardDataHelper,
};
