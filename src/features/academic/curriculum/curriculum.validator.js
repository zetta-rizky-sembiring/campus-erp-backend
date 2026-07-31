// *************** IMPORT LIBRARY ***************
const Joi = require('joi');

// *************** IMPORT VALIDATOR ***************
const GradingRuleSchema = Joi.object({
  label: Joi.string().trim().required(),
  operator: Joi.string().valid('>', '>=', '<', '<=', '==').required(),
  threshold: Joi.number().strict().required(),
}).unknown(false);

const GradingRulesSchema = Joi.array().items(GradingRuleSchema).optional();
const WeightageSchema = Joi.number().strict().greater(0).max(100).required();

const CreateBlockSchema = Joi.object({
  name: Joi.string().trim().required(),
  academic_year: Joi.string().trim().required(),
  grading_rules: GradingRulesSchema,
}).unknown(false);

const UpdateBlockSchema = Joi.object({
  name: Joi.string().trim().optional(),
  academic_year: Joi.string().trim().optional(),
  grading_rules: GradingRulesSchema,
}).unknown(false);

const CreateSubjectSchema = Joi.object({
  name: Joi.string().trim().required(),
  block_id: Joi.string().trim().required(),
  weightage: WeightageSchema,
  grading_rules: GradingRulesSchema,
}).unknown(false);

const UpdateSubjectSchema = Joi.object({
  name: Joi.string().trim().optional(),
  block_id: Joi.string().trim().optional(),
  weightage: WeightageSchema.optional(),
  grading_rules: GradingRulesSchema,
}).unknown(false);

const CreateTestSchema = Joi.object({
  name: Joi.string().trim().required(),
  subject_id: Joi.string().trim().required(),
  weightage: WeightageSchema,
  grading_rules: GradingRulesSchema,
}).unknown(false);

const UpdateTestSchema = Joi.object({
  name: Joi.string().trim().optional(),
  subject_id: Joi.string().trim().optional(),
  weightage: WeightageSchema.optional(),
  grading_rules: GradingRulesSchema,
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
  GradingRuleSchema,
  WeightageSchema,
  CreateBlockSchema,
  UpdateBlockSchema,
  CreateSubjectSchema,
  UpdateSubjectSchema,
  CreateTestSchema,
  UpdateTestSchema,
  ValidateInput,
};
