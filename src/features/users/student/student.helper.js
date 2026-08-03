// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODULE ***************
const { StudentModel } = require('./student.model');
const { AppError,  ERROR_CODES } = require('../../../core/error');

// *************** IMPORT UTILITIES ***************
const { NormalizeObjectId } = require('../../../shared/utils/normalize_object_id');

/**
 * Creates a new student record.
 * @param {Object} studentData - The data for the new student.
 * @returns {Object} The created student record.
 */
async function CreateStudentHelper(studentData) {
  try {
    const newStudent = new StudentModel(studentData);
    const savedStudent = await newStudent.save();
    return savedStudent.toObject();
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Duplicate entry detected', ERROR_CODES.DUPLICATE_ENTRY);
    }
    throw error;
  }
}

/**
 * Retrieves all student records from the database.
 * @returns {Array} An array of student records.
 */
async function GetAllStudentsHelper() {
    return await StudentModel.find().lean();
}

// *************** EXPORT MODULE ***************
module.exports = {
  CreateStudentHelper,
  GetAllStudentsHelper,
};