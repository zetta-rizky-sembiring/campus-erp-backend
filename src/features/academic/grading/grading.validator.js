// *************** IMPORT LIBRARY ***************
const Joi = require('joi');

// *************** IMPORT MODULE ***************
const { AppError } = require('../../../core/error');

// *************** GLOBAL VARIABLES ***************
const ObjectIdHexSchema = Joi.string().trim().length(24).hex();

// *************** IMPORT VALIDATOR ***************
const SubmitTestGradesSchema = Joi.object({
  test_id: ObjectIdHexSchema.required(),
  academic_year_id: ObjectIdHexSchema.required(),
  grades: Joi.array()
    .items(
      Joi.object({
        student_id: ObjectIdHexSchema.required(),
        score: Joi.number().min(0).max(100).required(),
      }),
    )
    .min(1)
    .required(),
}).unknown(false);

// *************** EXPORT MODULE ***************
module.exports = {
  SubmitTestGradesSchema,
};
