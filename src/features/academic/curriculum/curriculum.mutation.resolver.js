// *************** IMPORT MODULE ***************
const { BlockModel, SubjectModel, TestModel } = require('./curriculum.model');
const {
  ValidateInput,
  CreateBlockSchema,
  UpdateBlockSchema,
  CreateSubjectSchema,
  UpdateSubjectSchema,
  CreateTestSchema,
  UpdateTestSchema,
} = require('./curriculum.validator');
const {
  EnsureSubjectWeightageWithinLimit,
  EnsureTestWeightageWithinLimit,
  EnsureNoGradesLock,
} = require('./curriculum.helper');
const { AppError } = require('../../../core/error');
const { NormalizeGqlError } = require('../../../shared/utils/normalize_gql_error');
const { NormalizeObjectId } = require('../../../shared/utils/normalize_object_id');

// *************** MUTATION ***************

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
  const document = await BlockModel.findByIdAndUpdate(NormalizeObjectId(id), { $set: payload }, {
    new: true,
    runValidators: true,
  });

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
  const document = await SubjectModel.findByIdAndUpdate(NormalizeObjectId(id), { $set: payload }, {
    new: true,
    runValidators: true,
  });

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
  const document = await TestModel.findByIdAndUpdate(NormalizeObjectId(id), { $set: payload }, {
    new: true,
    runValidators: true,
  });

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
 * Create a curriculum block.
 * @param {Object} _
 * @param {{ input: Object }} args
 * @returns {Promise<Object>}
 */
async function CreateBlock(_, { input }) {
  try {
    const payload = ValidateInput(CreateBlockSchema, input);
    return CreateBlockRecord(payload);
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

/**
 * Update a curriculum block.
 * @param {Object} _
 * @param {{ id: String, input: Object }} args
 * @returns {Promise<Object>}
 */
async function UpdateBlock(_, { id, input }) {
  try {
    const payload = ValidateInput(UpdateBlockSchema, input);
    return UpdateBlockRecord(id, payload);
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

/**
 * Delete a curriculum block.
 * @param {Object} _
 * @param {{ id: String }} args
 * @returns {Promise<Boolean>}
 */
async function DeleteBlock(_, { id }) {
  try {
    return DeleteBlockRecord(id);
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

/**
 * Create a curriculum subject.
 * @param {Object} _
 * @param {{ input: Object }} args
 * @returns {Promise<Object>}
 */
async function CreateSubject(_, { input }) {
  try {
    const payload = ValidateInput(CreateSubjectSchema, input);
    return CreateSubjectRecord(payload);
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

/**
 * Update a curriculum subject.
 * @param {Object} _
 * @param {{ id: String, input: Object }} args
 * @returns {Promise<Object>}
 */
async function UpdateSubject(_, { id, input }) {
  try {
    const payload = ValidateInput(UpdateSubjectSchema, input);
    return UpdateSubjectRecord(id, payload);
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

/**
 * Delete a curriculum subject.
 * @param {Object} _
 * @param {{ id: String }} args
 * @returns {Promise<Boolean>}
 */
async function DeleteSubject(_, { id }) {
  try {
    return DeleteSubjectRecord(id);
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

/**
 * Create a curriculum test.
 * @param {Object} _
 * @param {{ input: Object }} args
 * @returns {Promise<Object>}
 */
async function CreateTest(_, { input }) {
  try {
    const payload = ValidateInput(CreateTestSchema, input);
    return CreateTestRecord(payload);
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

/**
 * Update a curriculum test.
 * @param {Object} _
 * @param {{ id: String, input: Object }} args
 * @returns {Promise<Object>}
 */
async function UpdateTest(_, { id, input }) {
  try {
    const payload = ValidateInput(UpdateTestSchema, input);
    return UpdateTestRecord(id, payload);
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

/**
 * Delete a curriculum test.
 * @param {Object} _
 * @param {{ id: String }} args
 * @returns {Promise<Boolean>}
 */
async function DeleteTest(_, { id }) {
  try {
    return DeleteTestRecord(id);
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  CreateBlock,
  UpdateBlock,
  DeleteBlock,
  CreateSubject,
  UpdateSubject,
  DeleteSubject,
  CreateTest,
  UpdateTest,
  DeleteTest,
};
