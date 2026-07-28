require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT),
  db: {
    uri: process.env.MONGO_URI,
  },
};

// Validation for environment variables
const required = ['PORT', 'MONGO_URI'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}