// *************** IMPORT MODULE ***************
const { BlockModel, SubjectModel, TestModel } = require('./curriculum.model');
const { NormalizeObjectId } = require('../../../shared/utils/normalize_object_id');

// *************** QUERY ***************
/**
 * Retrieve all curriculum blocks.
 * @returns {Promise<Object[]>}
 */
async function GetAllBlocks() {
  const documents = await BlockModel.find().lean();
  return documents;
}

/**
 * Retrieve a curriculum block by its identifier.
 * @param {Object} _
 * @param {{ id: String }} args
 * @returns {Promise<Object|null>}
 */
async function GetOneBlock(_, { id }) {
  const document = await BlockModel.findById(NormalizeObjectId(id)).lean();
  return document;
}

/**
 * Retrieve all curriculum subjects.
 * @returns {Promise<Object[]>}
 */
async function GetAllSubjects() {
  const documents = await SubjectModel.find().lean();
  return documents;
}

/**
 * Retrieve a curriculum subject by its identifier.
 * @param {Object} _
 * @param {{ id: String }} args
 * @returns {Promise<Object|null>}
 */
async function GetOneSubject(_, { id }) {
  const document = await SubjectModel.findById(NormalizeObjectId(id)).lean();
  return document;
}

/**
 * Retrieve all curriculum tests.
 * @returns {Promise<Object[]>}
 */
async function GetAllTests() {
  const documents = await TestModel.find().lean();
  return documents;
}

/**
 * Retrieve a curriculum test by its identifier.
 * @param {Object} _
 * @param {{ id: String }} args
 * @returns {Promise<Object|null>}
 */
async function GetOneTest(_, { id }) {
  const document = await TestModel.findById(NormalizeObjectId(id)).lean();
  return document;
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