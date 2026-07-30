// *************** IMPORT LIBRARY ***************
const Joi = require('joi');

// *************** IMPORT VALIDATOR ***************
const gradingRuleSchema = Joi.object({
  label: Joi.string().trim().required(),
  operator: Joi.string().valid('>', '>=', '<', '<=', '==').required(),
  threshold: Joi.number().strict().required(),
}).unknown(false);

const gradingRulesSchema = Joi.array().items(gradingRuleSchema).optional();
const weightageSchema = Joi.number().strict().greater(0).max(100).required();

const createBlockSchema = Joi.object({
  name: Joi.string().trim().required(),
  academicYear: Joi.string().trim().required(),
  gradingRules: gradingRulesSchema,
  grading_rules: gradingRulesSchema,
}).unknown(false);

const updateBlockSchema = Joi.object({
  name: Joi.string().trim().optional(),
  academicYear: Joi.string().trim().optional(),
  gradingRules: gradingRulesSchema,
  grading_rules: gradingRulesSchema,
}).unknown(false);

const createSubjectSchema = Joi.object({
  name: Joi.string().trim().required(),
  blockId: Joi.string().trim().required(),
  weightage: weightageSchema,
  gradingRules: gradingRulesSchema,
  grading_rules: gradingRulesSchema,
}).unknown(false);

const updateSubjectSchema = Joi.object({
  name: Joi.string().trim().optional(),
  blockId: Joi.string().trim().optional(),
  weightage: weightageSchema.optional(),
  gradingRules: gradingRulesSchema,
  grading_rules: gradingRulesSchema,
}).unknown(false);

const createTestSchema = Joi.object({
  name: Joi.string().trim().required(),
  subjectId: Joi.string().trim().required(),
  weightage: weightageSchema,
  gradingRules: gradingRulesSchema,
  grading_rules: gradingRulesSchema,
}).unknown(false);

const updateTestSchema = Joi.object({
  name: Joi.string().trim().optional(),
  subjectId: Joi.string().trim().optional(),
  weightage: weightageSchema.optional(),
  gradingRules: gradingRulesSchema,
  grading_rules: gradingRulesSchema,
}).unknown(false);

const ValidateInput = (schema, payload) => {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    const details = error.details.map((detail) => detail.message).join(', ');
    throw new Error(`Validation failed: ${details}`);
  }

  return value;
};

// *************** EXPORT MODULE ***************
module.exports = {
  gradingRuleSchema,
  weightageSchema,
  createBlockSchema,
  updateBlockSchema,
  createSubjectSchema,
  updateSubjectSchema,
  createTestSchema,
  updateTestSchema,
  ValidateInput,
};
