// *************** IMPORT MODULE ***************
const { BlockModel, SubjectModel, TestModel } = require('./curriculum.model');
const { NormalizeObjectId } = require('../../../shared/utils/normalize_object_id');

function SerializeBlock(document) {
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

function SerializeSubject(document) {
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

function SerializeTest(document) {
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

async function GetBlocks() {
  const documents = await BlockModel.find().lean();
  return (documents || []).map(SerializeBlock);
}

async function GetBlock(_, { id }) {
  const document = await BlockModel.findById(NormalizeObjectId(id)).lean();
  return document ? SerializeBlock(document) : null;
}

async function GetSubjects() {
  const documents = await SubjectModel.find().lean();
  return (documents || []).map(SerializeSubject);
}

async function GetSubject(_, { id }) {
  const document = await SubjectModel.findById(NormalizeObjectId(id)).lean();
  return document ? SerializeSubject(document) : null;
}

async function GetTests() {
  const documents = await TestModel.find().lean();
  return (documents || []).map(SerializeTest);
}

async function GetTest(_, { id }) {
  const document = await TestModel.findById(NormalizeObjectId(id)).lean();
  return document ? SerializeTest(document) : null;
}

module.exports = {
  blocks: GetBlocks,
  block: GetBlock,
  subjects: GetSubjects,
  subject: GetSubject,
  tests: GetTests,
  test: GetTest,
};
