// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** GLOBAL VARIABLES ***************
const { Schema, model } = mongoose;

/**
 * Represents the computed hierarchical academic standing
 * (PASS / FAIL / RETAKE) of a student for a given academic year and block,
 * including each subject and test they were graded in.
 */
const AcademicStandingSchema = new Schema({
  // Reference to the student whose standing was computed
  student_id: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },

  // Reference to the academic year the standing belongs to
  academic_year_id: {
    type: Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true,
  },

  // Reference to the block the standing was computed for
  block_id: {
    type: Schema.Types.ObjectId,
    ref: 'Block',
    required: true,
  },

  // Average marks across all graded subjects in the block
  block_average: {
    type: Number,
    required: true,
  },

  // Overall standing of the student in the block
  block_status: {
    type: String,
    enum: ['PASS', 'FAIL', 'RETAKE'],
    required: true,
  },

  // Per-subject breakdown with the tests graded within each subject
  subjects: {
    type: [
      {
        // Reference to the graded subject
        subject_id: {
          type: Schema.Types.ObjectId,
          ref: 'Subject',
          required: true,
        },

        // Average marks across all graded tests of the subject
        subject_average: {
          type: Number,
          required: true,
        },

        // Standing of the student in the subject
        subject_status: {
          type: String,
          enum: ['PASS', 'FAIL', 'RETAKE'],
          required: true,
        },

        // Per-test breakdown for the subject
        tests: {
          type: [
            {
              // Reference to the graded test
              test_id: {
                type: Schema.Types.ObjectId,
                ref: 'Test',
                required: true,
              },

              // Total marks obtained by the student on the test
              total_mark: {
                type: Number,
                required: true,
              },

              // Standing of the student on the test
              test_status: {
                type: String,
                enum: ['PASS', 'FAIL', 'RETAKE'],
                required: true,
              },
            },
          ],
          default: [],
        },
      },
    ],
    default: [],
  },
});

// Compound index: one standing document per student, academic year, and block
AcademicStandingSchema.index(
  {
    student_id: 1,
    academic_year_id: 1,
    block_id: 1,
  },
  {
    unique: true,
  },
);

const AcademicStandingModel = model('AcademicStanding', AcademicStandingSchema);

// *************** EXPORT MODULE ***************
module.exports = {
  AcademicStandingModel,
};
