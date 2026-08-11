// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** GLOBAL VARIABLES ***************
const { Schema, model } = mongoose;

/**
 * Represents an immutable grade submitted by a student
 * for a specific test within an academic year.
 */
const StudentGradeSchema = new Schema({
  // Reference to the student receiving the grade
  student_id: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },

  // Reference to the test being graded
  test_id: {
    type: Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
  },

  // Reference to the academic year
  academic_year_id: {
    type: Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
  },

  // Score obtained by the student
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
});

// Compound index to prevent duplicate submissions
StudentGradeSchema.index(
  {
    student_id: 1,
    test_id: 1,
    academic_year_id: 1,
  },
  {
    unique: true,
  },
);

const StudentGradeModel = model('StudentGrade', StudentGradeSchema);

// *************** EXPORT MODULE ***************
module.exports = {
  StudentGradeModel,
};
