// *************** IMPORT LIBRARY ***************
const mongoose = require('mongoose');

// *************** IMPORT MODULE ***************
const config = require('./config');

// *************** GLOBAL VARIABLES ***************
mongoose
  .connect(config.db.uri)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

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
module.exports = mongoose.connection;