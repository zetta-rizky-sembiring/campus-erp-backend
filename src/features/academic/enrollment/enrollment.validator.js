// *************** IMPORT MODULE ***************
const Joi = require('joi');

// *************** IMPORT VALIDATOR ***************
const ObjectIdHexSchema = Joi.string().trim().length(24).hex();

const CreateEnrollmentSchema = Joi.object({
  academic_year_id: ObjectIdHexSchema.required(),
  student_ids: Joi.array().items(ObjectIdHexSchema).min(1).required(),
}).unknown(false);

const UpdateEnrollmentSchema = Joi.object({
  academic_year_id: ObjectIdHexSchema.optional(),
  student_ids: Joi.array().items(ObjectIdHexSchema).min(1).optional(),
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
  ObjectIdHexSchema,
  CreateEnrollmentSchema,
  UpdateEnrollmentSchema,
  ValidateInput,
};
