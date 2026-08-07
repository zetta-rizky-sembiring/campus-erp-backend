// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** GLOBAL VARIABLES ***************
const { Schema, model } = mongoose;

/**
 * Represents a system user who can authenticate and access protected resources.
 */
const UserSchema = new Schema({
  // User's name; optional
  name: {
    type: String,
  },
  // User's email address; must be unique
  email: {
    type: String,
    required: true,
    unique: true,
  },

  // User's hashed password
  password: {
    type: String,
    required: true,
  },

  // User's role used for authorization
  role: {
    type: String,
    required: true,
    enum: ['ADMIN', 'TEACHER'],
  },
});

const UserModel = model('User', UserSchema);

// *************** EXPORT MODEL ***************
module.exports = {
  UserModel,
};
