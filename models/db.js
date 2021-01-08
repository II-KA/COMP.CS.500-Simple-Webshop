const mongoose = require('mongoose');
require('dotenv').config();
/**
 * Get database connect URL.
 *
 * Reads URL from DBURL environment variable or
 * returns default URL if variable is not defined
 *
 * @returns {string} connection URL
 */
const getDbUrl = () => {
  return process.env.DBURL || 'mongodb://localhost:27017/WebShopDb';
};

/**
 * Connects to database if not connected yet
 * otherwise nothing is done
 */
function connectDB () {
  if (!mongoose.connection || mongoose.connection.readyState === 0) {
    mongoose
      .connect(getDbUrl(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
        autoIndex: true
      })
      .then(() => {
        mongoose.connection.on('error', err => {
          console.error(err);
        });

        mongoose.connection.on('reconnectFailed', handleCriticalError);
      })
      .catch(handleCriticalError);
  }
}

/**
 * Logs an error on the console and throws it
 * 
 * @param {object} err Error
 */
function handleCriticalError (err) {
  console.error(err);
  throw err;
}

/**
 * Disconnects from database
 */
function disconnectDB () {
  mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB, getDbUrl };
