// *************** IMPORT LIBRARY ***************
require('dotenv').config();

// *************** GLOBAL VARIABLES ***************
const required = ['PORT', 'MONGO_URI'];

// *************** Validation for environment variables
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// *************** EXPORT MODULE ***************
module.exports = {
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT),
  db: {
    uri: process.env.MONGO_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
  },
};
