// *************** IMPORT LIBRARY ***************
const Joi = require('joi');

// *************** IMPORT MODULE ***************
const { AppError } = require('../../../core/error');

// *************** GLOBAL VARIABLES ***************
const ObjectIdHexSchema = Joi.string().trim().length(24).hex();

const LoginSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string().trim().required(),
});

// *************** IMPORT HELPER FUNCTION ***************
const ValidateInput = (schema, payload) => {
  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    allowUnknown: false,
  });

  if (error) {
    const details = error.details.map((detail) => detail.message).join(', ');
    throw new AppError(`Validation failed: ${details}`, 'VALIDATION_ERROR', 400);
  }

  return value;
};

// *************** EXPORT MODULE ***************
module.exports = {
  LoginSchema,
  ValidateInput,
};
