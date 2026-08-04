// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** GLOBAL VARIABLES ***************
const { Schema, model } = mongoose;

/**
 * Represents an academic year or cohort period, including the students
 * enrolled in that year and the blocks associated with it.
 */
const AcademicYearSchema = new Schema({
  // Name of the academic year or cohort, such as "2025/2026"
  name: {
    type: String,
    required: true,
  },

  // Start date of the academic year
  start_date: {
    type: Date,
    required: true,
  },

  // End date of the academic year
  end_date: {
    type: Date,
    required: true,
  },

  // Current status of the academic year
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'],
    default: 'ACTIVE',
  },

  // References to curriculum blocks belonging to this academic year
  block_ids: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Block',
      },
    ],
    required: true,
  },

  // References to students enrolled in this academic year
  student_ids: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    default: [],
  },
});

const AcademicYearModel = model('AcademicYear', AcademicYearSchema);

// *************** EXPORT MODEL ***************
module.exports = {
  AcademicYearModel,
};
