// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** GLOBAL VARIABLES ***************
const { Schema, model } = mongoose;

const GradingRuleSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
    },
    operator: {
      type: String,
      required: true,
      enum: ['>', '>=', '<', '<=', '=='],
    },
    threshold: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const BlockSchema = new Schema({
  // Name of the academic block or learning cohort
  name: {
    type: String,
    required: true,
  },

  // Academic year associated with this block
  academic_year: {
    type: String,
    required: true,
  },

  // Grading rules that apply to this block
  grading_rules: [GradingRuleSchema],
});

const SubjectSchema = new Schema({
  // Name of the subject within the curriculum
  name: {
    type: String,
    required: true,
  },

  // Reference to the block that contains this subject
  block_id: {
    type: Schema.Types.ObjectId,
    ref: 'Block',
    required: true,
  },

  // Weightage value used in grading calculations
  weightage: {
    type: Number,
    required: true,
  },

  // Grading rules specific to this subject
  grading_rules: [GradingRuleSchema],
});

const TestSchema = new Schema({
  // Name of the assessment or test
  name: {
    type: String,
    required: true,
  },

  // Reference to the subject this test belongs to
  subject_id: {
    type: Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },

  // Weightage value assigned to this test
  weightage: {
    type: Number,
    required: true,
  },

  // Grading rules used for evaluating this test
  grading_rules: [GradingRuleSchema],
});

const BlockModel = model('Block', BlockSchema);
const SubjectModel = model('Subject', SubjectSchema);
const TestModel = model('Test', TestSchema);

// *************** EXPORT MODULE ***************
module.exports = {
  BlockSchema,
  SubjectSchema,
  TestSchema,
  BlockModel,
  SubjectModel,
  TestModel,
};