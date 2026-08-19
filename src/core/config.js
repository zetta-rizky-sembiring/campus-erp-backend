// *************** IMPORT LIBRARY ***************
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// *************** GLOBAL VARIABLES ***************
const required = ['PORT', 'MONGO_URI', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'WEBHOOK_WAREHOUSE_URL'];

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
    secret: process.env.JWT_SECRET,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  webhook: {
    warehouse: String(process.env.WEBHOOK_WAREHOUSE_URL),
  },
};
