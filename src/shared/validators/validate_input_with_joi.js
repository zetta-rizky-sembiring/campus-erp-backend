// *************** IMPORT MODULE ***************
const { AppError } = require('../../core/error');

/**
 * Validates the input payload against the provided schema.
 * @param {Object} schema - The Joi schema to validate against.
 * @param {Object} payload - The input payload to validate.
 * @returns {Object} The validated payload.
 */
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
module.exports = ValidateInput;
