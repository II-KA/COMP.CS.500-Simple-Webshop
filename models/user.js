const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const saltRounds = 10;

const encrypt = (text) => {
  if (!text || text.length < 10) return false;
  return bcrypt.hashSync(text, saltRounds);
};

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    dropUps: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  },
  password: {
    type: String,
    required: true,
    minlength: 10,
    set: encrypt
  },
  role: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    enum: ['admin', 'customer'],
    default: 'customer'
  }
});

/**
 * Compare supplied password with user's own (hashed) password
 *
 * @param {string} password Password to be compared
 * @returns {Promise<boolean>} promise that resolves to the comparison result
 */
userSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Omit the version key when serialized to JSON
userSchema.set('toJSON', { virtuals: false, versionKey: false });

const User = new mongoose.model('User', userSchema);
module.exports = User;
