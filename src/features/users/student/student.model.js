// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** GLOBAL VARIABLES ***************
const { Schema, model } = mongoose;

/**
 * Represents a student profile and the academic years they have been enrolled in.
 */
const StudentSchema = new Schema({
  // Student's first name
  first_name: {
    type: String,
    required: true,
  },

  // Student's last name
  last_name: {
    type: String,
    required: true,
  },

  // Student's email address; must be unique
  email: {
    type: String,
    required: true,
    unique: true,
  },

  // Student identification number; must be unique
  student_number: {
    type: String,
    required: true,
    unique: true,
  },

  // Date the student profile was created
  registration_date: {
    type: Date,
    default: Date.now,
  },

  // References to academic years the student has participated in
  academic_year_ids: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AcademicYear',
      },
    ],
    default: [],
  },
});

const StudentModel = model('Student', StudentSchema);

// *************** EXPORT MODEL ***************
module.exports = {
  StudentModel,
};
