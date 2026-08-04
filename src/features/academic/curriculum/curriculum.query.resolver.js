// *************** IMPORT MODULE ***************
const { BlockModel, SubjectModel, TestModel } = require('./curriculum.model');
const {
  GetAllBlocksHelper,
  GetOneBlockHelper,
  GetAllSubjectsHelper,
  GetOneSubjectHelper,
  GetAllTestsHelper,
  GetOneTestHelper,
} = require('./curriculum.helper');

// *************** IMPORT UTILITIES ***************
const { NormalizeGqlError, NormalizeObjectId } = require('../../../shared/utils/normalize_object_id');

// *************** QUERY ***************
/**
 * Resolve the query to retrieve all curriculum blocks.
 * @returns {Promise<Object[]>} A list of curriculum block documents.
 */
async function GetAllBlocks() {
  try {
    return await GetAllBlocksHelper();
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

/**
 * Resolve the query to retrieve a curriculum block by its identifier.
 * @param {Object} _ - The GraphQL parent resolver object.
 * @param {{ id: String }} args - GraphQL query arguments.
 * @returns {Promise<Object|null>} The matching curriculum block document, or null if not found.
 */
async function GetOneBlock(_, { id }) {
  try {
    return await GetOneBlockHelper(id);
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

/**
 * Resolve the query to retrieve all curriculum subjects.
 * @returns {Promise<Object[]>} A list of curriculum subject documents.
 */
async function GetAllSubjects() {
  try {
    return await GetAllSubjectsHelper();
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

/**
 * Resolve the query to retrieve a curriculum subject by its identifier.
 * @param {Object} _ - The GraphQL parent resolver object.
 * @param {{ id: String }} args - GraphQL query arguments.
 * @returns {Promise<Object|null>} The matching curriculum subject document, or null if not found.
 */
async function GetOneSubject(_, { id }) {
  try {
    return await GetOneSubjectHelper(id);
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

/**
 * Resolve the query to retrieve all curriculum tests.
 * @returns {Promise<Object[]>} A list of curriculum test documents.
 */
async function GetAllTests() {
  try {
    return await GetAllTestsHelper();
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

/**
 * Resolve the query to retrieve a curriculum test by its identifier.
 * @param {Object} _ - The GraphQL parent resolver object.
 * @param {{ id: String }} args - GraphQL query arguments.
 * @returns {Promise<Object|null>} The matching curriculum test document, or null if not found.
 */
async function GetOneTest(_, { id }) {
  try {
    return await GetOneTestHelper(id);
  } catch (error) {
    throw NormalizeGqlError(error);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  GetAllBlocks,
  GetOneBlock,
  GetAllSubjects,
  GetOneSubject,
  GetAllTests,
  GetOneTest,
};
