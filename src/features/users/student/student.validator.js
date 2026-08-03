// *************** IMPORT LIBRARY ***************
const Joi = require('joi');

// *************** IMPORT VALIDATOR ***************
const CreateStudentSchema = Joi.object({
  first_name: Joi.string().trim().required(),
  last_name: Joi.string().trim().required(),
  email: Joi.string().email().trim().required(),
  student_number: Joi.string().trim().required(),
  registration_date: Joi.date().iso().optional(),
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
    CreateStudentSchema,
    ValidateInput
};
