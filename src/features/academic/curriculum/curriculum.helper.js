// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODULE ***************
const { BlockModel, SubjectModel, TestModel } = require('./curriculum.model');
const { AppError, ERROR_CODES } = require('../../../core/error');

// *************** IMPORT UTILITIES ***************
const { NormalizeObjectId } = require('../../../shared/utils/normalize_object_id');

/**
 * Retrieve all curriculum blocks.
 * @returns {Promise<Object[]>} A list of curriculum block documents.
 */
async function GetAllBlocksHelper() {
  return await BlockModel.find().lean();
}

/**
 * Retrieve a curriculum block by its identifier.
 * @param {String} id - The curriculum block identifier.
 * @returns {Promise<Object|null>} The matching curriculum block document, or null if not found.
 */
async function GetOneBlockHelper(id) {
  return await BlockModel.findById(NormalizeObjectId(id)).lean();
}

/**
 * Retrieve all curriculum subjects.
 * @returns {Promise<Object[]>} A list of curriculum subject documents.
 */
async function GetAllSubjectsHelper() {
  return await SubjectModel.find().lean();
}

/**
 * Retrieve a curriculum subject by its identifier.
 * @param {String} id - The curriculum subject identifier.
 * @returns {Promise<Object|null>} The matching curriculum subject document, or null if not found.
 */
async function GetOneSubjectHelper(id) {
  return await SubjectModel.findById(NormalizeObjectId(id)).lean();
}

/**
 * Retrieve all curriculum tests.
 * @returns {Promise<Object[]>} A list of curriculum test documents.
 */
async function GetAllTestsHelper() {
  return await TestModel.find().lean();
}

/**
 * Retrieve a curriculum test by its identifier.
 * @param {String} id - The curriculum test identifier.
 * @returns {Promise<Object|null>} The matching curriculum test document, or null if not found.
 */
async function GetOneTestHelper(id) {
  return await TestModel.findById(NormalizeObjectId(id)).lean();
}

/**
 * Create a new block record.
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
async function CreateBlockRecord(payload) {
  const document = await BlockModel.create(payload);
  return document;
}

/**
 * Update an existing block.
 * @param {String|ObjectId} id
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
async function UpdateBlockRecord(id, payload) {
  const document = await BlockModel.findByIdAndUpdate(
    NormalizeObjectId(id),
    { $set: payload },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!document) {
    throw new AppError('Block not found', 'NOT_FOUND', 404);
  }

  return document;
}

/**
 * Delete a block after ensuring it is not referenced by student grades.
 * @param {String|ObjectId} id
 * @returns {Promise<Boolean>}
 */
async function DeleteBlockRecord(id) {
  const objectId = NormalizeObjectId(id);
  await EnsureNoGradesLock('block', objectId);
  const result = await BlockModel.deleteOne({ _id: objectId });
  return result.deletedCount > 0;
}

/**
 * Create a new subject.
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
async function CreateSubjectRecord(payload) {
  await EnsureSubjectWeightageWithinLimit(payload.block_id, payload.weightage);
  const document = await SubjectModel.create(payload);
  return document;
}

/**
 * Update an existing subject.
 * @param {String|ObjectId} id
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
async function UpdateSubjectRecord(id, payload) {
  const document = await SubjectModel.findByIdAndUpdate(
    NormalizeObjectId(id),
    { $set: payload },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!document) {
    throw new AppError('Subject not found', 'NOT_FOUND', 404);
  }

  return document;
}

/**
 * Delete a subject after ensuring it is not referenced by student grades.
 * @param {String|ObjectId} id
 * @returns {Promise<Boolean>}
 */
async function DeleteSubjectRecord(id) {
  const objectId = NormalizeObjectId(id);
  await EnsureNoGradesLock('subject', objectId);
  const result = await SubjectModel.deleteOne({ _id: objectId });
  return result.deletedCount > 0;
}

/**
 * Create a new test.
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
async function CreateTestRecord(payload) {
  await EnsureTestWeightageWithinLimit(payload.subject_id, payload.weightage);
  const document = await TestModel.create(payload);
  return document;
}

/**
 * Update an existing test.
 * @param {String|ObjectId} id
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
async function UpdateTestRecord(id, payload) {
  const document = await TestModel.findByIdAndUpdate(
    NormalizeObjectId(id),
    { $set: payload },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!document) {
    throw new AppError('Test not found', 'NOT_FOUND', 404);
  }

  return document;
}

/**
 * Delete a test after ensuring it is not referenced by student grades.
 * @param {String|ObjectId} id
 * @returns {Promise<Boolean>}
 */
async function DeleteTestRecord(id) {
  const objectId = NormalizeObjectId(id);
  await EnsureNoGradesLock('test', objectId);
  const result = await TestModel.deleteOne({ _id: objectId });
  return result.deletedCount > 0;
}

/**
 * Round a weightage value to two decimal places.
 * @param {Number} value
 * @returns {Number}
 */
function RoundWeightage(total) {
  return Math.round((total + Number.EPSILON) * 100) / 100;
}

/**
 * Ensure total subject weightage for a block does not exceed 100.
 * @param {String|mongoose.Types.ObjectId} blockId
 * @param {Number} incomingWeightage
 * @param {String|mongoose.Types.ObjectId} [excludeSubjectId]
 */
async function EnsureSubjectWeightageWithinLimit(blockId, incomingWeightage) {
  // *************** START: Normalize identifiers and load existing subject weightages ***************
  const blockObjectId = NormalizeObjectId(blockId);
  const subjects = await SubjectModel.find({ block_id: blockObjectId }).select('weightage').lean();
  // *************** END: Normalize identifiers and load existing subject weightages ***************

  // *************** START: Calculate total subject weightage ***************
  const existingTotal = subjects.reduce((sum, s) => sum + (Number(s.weightage) || 0), 0);
  const total = RoundWeightage(existingTotal + Number(incomingWeightage || 0));
  if (total > 100) {
    throw new AppError(
      `Total subject weightage for block ${blockId} would be ${total}%, exceeding 100%`,
      ERROR_CODES.WEIGHTAGE_LIMIT_EXCEEDED,
      400,
    );
  }
  // *************** END: Calculate total subject weightage ***************

  return true;
}

/**
 * Ensure total test weightage for a subject does not exceed 100.
 * @param {String|mongoose.Types.ObjectId} subjectId
 * @param {Number} incomingWeightage
 * @param {String|mongoose.Types.ObjectId} [excludeTestId]
 */
async function EnsureTestWeightageWithinLimit(subjectId, incomingWeightage) {
  // *************** START: Normalize identifiers and load existing test weightages ***************
  const subjectObjectId = NormalizeObjectId(subjectId);
  const tests = await TestModel.find({ subject_id: subjectObjectId }).select('weightage').lean();
  // *************** END: Normalize identifiers and load existing test weightages ***************

  // *************** START: Calculate total test weightage ***************
  const existingTotal = tests.reduce((sum, t) => sum + (Number(t.weightage) || 0), 0);
  const total = RoundWeightage(existingTotal + Number(incomingWeightage || 0));
  if (total > 100) {
    throw new AppError(
      `Total test weightage for subject ${subjectId} would be ${total}%, exceeding 100%`,
      ERROR_CODES.WEIGHTAGE_LIMIT_EXCEEDED,
      400,
    );
  }
  // *************** END: Calculate total test weightage ***************

  return true;
}

/**
 * Relational locking: prevent updates/deletes if any student grades reference the entity.
 * entityType: 'block' | 'subject' | 'test'
 * entityId: string/ObjectId
 *
 * Ensure the specified curriculum entity is not referenced by any student grades.
 * @param {'block'|'subject'|'test'} entityType
 * @param {String|mongoose.Types.ObjectId} entityId
 */

async function EnsureNoGradesLock(entityType, entityId) {
  // *************** START: Normalize identifier and build grade lock query ***************
  const db = mongoose.connection.db;
  const col = db.collection('studentgrades');
  const oid = NormalizeObjectId(entityId);

  let query = {};
  if (entityType === 'block') query = { block_id: oid };
  else if (entityType === 'subject') query = { subject_id: oid };
  else if (entityType === 'test') query = { test_id: oid };
  else throw new Error(`Unknown entityType: ${entityType}`);
  // *************** END: Normalize identifier and build grade lock query ***************

  const exists = await col.findOne(query, { projection: { _id: 1 } });
  if (exists) {
    throw new AppError(`Cannot modify ${entityType} ${entityId}: student grades exist`, ERROR_CODES.ENTITY_LOCKED_GRADES_EXIST, 409);
  }
  return true;
}

// *************** EXPORT MODULE ***************
module.exports = {
  GetAllBlocksHelper,
  GetOneBlockHelper,
  GetAllSubjectsHelper,
  GetOneSubjectHelper,
  GetAllTestsHelper,
  GetOneTestHelper,
  CreateBlockRecord,
  UpdateBlockRecord,
  DeleteBlockRecord,
  CreateSubjectRecord,
  UpdateSubjectRecord,
  DeleteSubjectRecord,
  CreateTestRecord,
  UpdateTestRecord,
  DeleteTestRecord,
};
