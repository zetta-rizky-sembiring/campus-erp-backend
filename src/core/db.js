// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODULE ***************
const config = require('./config');

const DatabaseConnection = mongoose.connect(config.db.uri);

mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// *************** EXPORT MODULE ***************
module.exports = {
  connection: mongoose.connection,
  DatabaseConnection,
};
