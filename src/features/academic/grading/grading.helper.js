// *************** IMPORT MODULE ***************
const { StudentGradeModel } = require('./student_grade.model');
const { StudentModel } = require('../../users/student/student.model');
const { TestModel } = require('../curriculum/curriculum.model');
const { AppError, ERROR_CODES } = require('../../../core/error');

// *************** IMPORT UTILITIES ***************
const { NormalizeObjectId } = require('../../../shared/utils/normalize_object_id');

/**
 * Submit test grades for an entire academic cohort with all-or-nothing semantics.
 *
 * @param {Object} payload - Validated input payload.
 * @param {Array<{ student_id: String, score: Number }>} payload.grades - Grades to submit.
 * @returns {Promise<Object[]>} The inserted StudentGrade documents.
 */
async function SubmitTestGradesHelper(payload) {
  // ***************Rule 1 - Curriculum Validation
  const testObjectId = NormalizeObjectId(payload.test_id);
  const testExists = await TestModel.exists({ _id: testObjectId });

  if (!testExists) {
    throw new AppError('Test not found', ERROR_CODES.TEST_NOT_FOUND, 404);
  }

  // ***************Rule 2 - Pre-Validation Setup
  const extractedStudentIds = payload.grades.map((grade) => NormalizeObjectId(grade.student_id));

  if (extractedStudentIds.length === 0 || extractedStudentIds.some((studentId) => !studentId)) {
    throw new AppError('Invalid student references', ERROR_CODES.INVALID_STUDENT_REFERENCE, 400);
  }

  // ***************Rule 3 - Efficient Foreign Key Check (single $in query, no N+1)
  const validStudents = await StudentModel.find({ _id: { $in: extractedStudentIds } });
  const validStudentMap = new Map(validStudents.map((student) => [student._id.toString(), student]));

  // ***************Rule 4 - The Validation Loop
  for (const grade of payload.grades) {
    const studentObjectId = NormalizeObjectId(grade.student_id);

    if (!validStudentMap.has(studentObjectId.toString())) {
      throw new AppError(`Student does not exist`, ERROR_CODES.INVALID_STUDENT_REFERENCE, 400);
    }
  }

  // ***************Rule 5 - Data Transformation
  const mappedGrades = payload.grades.map((grade) => ({
    student_id: NormalizeObjectId(grade.student_id),
    test_id: testObjectId,
    academic_year_id: NormalizeObjectId(payload.academic_year_id),
    score: grade.score,
  }));

  // ***************Rule 6 - Bulk Insert
  return await StudentGradeModel.insertMany(mappedGrades);
}

// *************** EXPORT MODULE ***************
module.exports = {
  SubmitTestGradesHelper,
};
