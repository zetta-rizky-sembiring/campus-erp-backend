// *************** IMPORT MODULE ***************
const { BlockModel, SubjectModel, TestModel } = require('./curriculum.model');

// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT HELPER FUNCTION ***************
function normalizeId(id) {
  if (!id) return id;
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
}

function serializeBlock(document) {
  const data = document?.toObject ? document.toObject() : document;
  return {
    id: data._id ? data._id.toString() : data.id,
    name: data.name,
    academicYear: data.academic_year || data.academicYear,
    gradingRules: (data.grading_rules || data.gradingRules || []).map((rule) => ({
      label: rule.label,
      operator: rule.operator,
      threshold: rule.threshold,
    })),
  };
}

function serializeSubject(document) {
  const data = document?.toObject ? document.toObject() : document;
  return {
    id: data._id ? data._id.toString() : data.id,
    name: data.name,
    blockId: data.block_id ? data.block_id.toString() : data.blockId,
    weightage: data.weightage,
    gradingRules: (data.grading_rules || data.gradingRules || []).map((rule) => ({
      label: rule.label,
      operator: rule.operator,
      threshold: rule.threshold,
    })),
  };
}

function serializeTest(document) {
  const data = document?.toObject ? document.toObject() : document;
  return {
    id: data._id ? data._id.toString() : data.id,
    name: data.name,
    subjectId: data.subject_id ? data.subject_id.toString() : data.subjectId,
    weightage: data.weightage,
    gradingRules: (data.grading_rules || data.gradingRules || []).map((rule) => ({
      label: rule.label,
      operator: rule.operator,
      threshold: rule.threshold,
    })),
  };
}

async function getBlocks() {
  const documents = await BlockModel.find().lean();
  return (documents || []).map(serializeBlock);
}

async function getBlock(_, { id }) {
  const document = await BlockModel.findById(normalizeId(id)).lean();
  return document ? serializeBlock(document) : null;
}

async function getSubjects() {
  const documents = await SubjectModel.find().lean();
  return (documents || []).map(serializeSubject);
}

async function getSubject(_, { id }) {
  const document = await SubjectModel.findById(normalizeId(id)).lean();
  return document ? serializeSubject(document) : null;
}

async function getTests() {
  const documents = await TestModel.find().lean();
  return (documents || []).map(serializeTest);
}

async function getTest(_, { id }) {
  const document = await TestModel.findById(normalizeId(id)).lean();
  return document ? serializeTest(document) : null;
}

module.exports = {
  blocks: getBlocks,
  block: getBlock,
  subjects: getSubjects,
  subject: getSubject,
  tests: getTests,
  test: getTest,
};
