// *************** IMPORT LIBRARY ***************
const Joi = require('joi');

// *************** IMPORT MODULE ***************
const { AppError } = require('../../../core/error');

// *************** GLOBAL VARIABLES ***************
const ObjectIdHexSchema = Joi.string().trim().length(24).hex();

// *************** IMPORT VALIDATOR ***************
const CreateStudentSchema = Joi.object({
  first_name: Joi.string().trim().required(),
  last_name: Joi.string().trim().required(),
  email: Joi.string().email().trim().required(),
  student_number: Joi.string().trim().required(),
  registration_date: Joi.date().iso().optional(),
}).unknown(false);

const GetStudentsByAcademicYearSchema = Joi.object({
  academic_year_id: ObjectIdHexSchema.required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().optional(),
}).unknown(false);

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
  CreateStudentSchema,
  GetStudentsByAcademicYearSchema,
  ValidateInput,
};
