// *************** IMPORT LIBRARY ***************
const Joi = require('joi');

// *************** GLOBAL VARIABLES ***************
const ObjectIdHexSchema = Joi.string().trim().length(24).hex();

const LoginSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email().trim().required(),
  password: Joi.string().trim().required(),
});

// *************** EXPORT MODULE ***************
module.exports = {
  LoginSchema,
};
