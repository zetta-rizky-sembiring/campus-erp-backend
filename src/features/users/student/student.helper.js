// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODULE ***************
const { StudentModel } = require('./student.model');
const { AppError, ERROR_CODES } = require('../../../core/error');

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

/**
 * Retrieves students by academic year with pagination and search.
 *
 * @param {Object} payload - The input payload containing academic year ID, pagination, and search parameters.
 * @returns {Promise<Object>} An object containing the total count, current page, total pages, and an array of student records.
 * @throws {AppError} Throws an error if validation fails or if there is a database error.
 */
async function GetStudentsByAcademicYearHelper(payload) {
  const { academic_year_id, page = 1, limit = 10, search = '' } = payload;

  // *************** Normalize the academic_year_id to ensure it's a valid ObjectId
  const academicYearId = NormalizeObjectId(academic_year_id);

  // *************** Stage 1($match) - Filter students by academic year and search criteria
  const match = {
    academic_year_ids: academicYearId,
  };

  // *************** Add search criteria if a search term is provided
  if (search.trim()) {
    match.$or = [
      {
        first_name: {
          $regex: search,
          $options: 'i',
        },
      },
      {
        last_name: {
          $regex: search,
          $options: 'i',
        },
      },
    ];
  }

  console.log('[DB] Student.aggregate()');

  // *************** Stage 2($facet) - Perform aggregation with pagination and total count
  const [result] = await StudentModel.aggregate([
    {
      $match: match,
    },
    {
      $facet: {
        metadata: [
          {
            $count: 'total',
          },
        ],
        data: [
          {
            $skip: (page - 1) * limit,
          },
          {
            $limit: limit,
          },
        ],
      },
    },
  ]);

  // *************** Calculate total count and total pages
  const total = result.metadata.length ? result.metadata[0].total : 0;

  // *************** Return the paginated response
  return {
    total_count: total,
    current_page: page,
    total_pages: Math.ceil(total / limit),
    data: result.data,
  };
}

// *************** EXPORT MODULE ***************
module.exports = {
  CreateStudentHelper,
  GetAllStudentsHelper,
  GetStudentsByAcademicYearHelper,
};
