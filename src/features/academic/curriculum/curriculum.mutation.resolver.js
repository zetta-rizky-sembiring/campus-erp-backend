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
  CreateBlockRecord,
  UpdateBlockRecord,
  DeleteBlockRecord,
  CreateSubjectRecord,
  UpdateSubjectRecord,
  DeleteSubjectRecord,
  CreateTestRecord,
  UpdateTestRecord,
  DeleteTestRecord
} = require('./curriculum.helper');
const { AppError } = require('../../../core/error');

// *************** IMPORT UTILITIES ***************
const { NormalizeGqlError } = require('../../../shared/utils/normalize_gql_error');


/**
 * Create a curriculum block.
 * @param {Object} _
 * @param {{ input: Object }} args
 * @returns {Promise<Object>}
 */
async function CreateBlock(_, { input }) {
  try {
    const payload = ValidateInput(CreateBlockSchema, input);
    return await CreateBlockRecord(payload);
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
    return await UpdateBlockRecord(id, payload);
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
    return await DeleteBlockRecord(id);
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
    return await CreateSubjectRecord(payload);
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
    return await UpdateSubjectRecord(id, payload);
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
    return await DeleteSubjectRecord(id);
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
    return await CreateTestRecord(payload);
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
    return await UpdateTestRecord(id, payload);
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
    return await DeleteTestRecord(id);
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
