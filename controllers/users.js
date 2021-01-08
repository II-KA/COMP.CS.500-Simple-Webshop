const http = require('http');
const responseUtils = require('../utils/responseUtils');
const User = require('../models/user');

/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response Server's response
 * @returns {http.ServerResponse} response
 */
const getAllUsers = async response => {
  const users = await User.find().select('-__v').lean();
  return responseUtils.sendJson(response, users);
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response Server's response
 * @param {string} userId Id of a user
 * @param {object} currentUser (mongoose document object)
 * @returns {http.ServerResponse} response
 */
const deleteUser = async (response, userId, currentUser) => {
  if (currentUser._id.toString() === userId) {
    return responseUtils.badRequest(response, 'Deletion of own data is not allowed');
  }
  const deleted = await User.findOneAndDelete({ _id: userId }).select('-__v').lean();
  if (!deleted) return responseUtils.notFound(response);
  return responseUtils.sendJson(response, deleted);
};

/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response Server's response
 * @param {string} userId Id of a user
 * @param {object} currentUser (mongoose document object)
 * @param {object} userData JSON data from request body
 * @returns {http.ServerResponse} response
 */
const updateUser = async (response, userId, currentUser, userData) => {
  if (currentUser._id.toString() === userId) {
    return responseUtils.badRequest(response, 'Updating own data is not allowed');
  }
  if (userData.role !== 'customer' && userData.role !== 'admin') {
    return responseUtils.badRequest(response, 'Role missing or not valid');
  }
  const updated = await User.findOneAndUpdate({ _id: userId }, { role: userData.role }, { new: true }).select('-__v').lean();
  if (!updated) return responseUtils.notFound(response);
  return responseUtils.sendJson(response, updated);
};

/**
 * Send user data as JSON
 *
 * @param {http.ServerResponse} response Server's response
 * @param {string} userId Id of a user
 * @param {object} currentUser (mongoose document object)
 * @returns {http.ServerResponse} response
 */
const viewUser = async (response, userId, currentUser) => {
  const user = await User.findOne({ _id: userId }).select('-__v').lean();
  if (!user) return responseUtils.notFound(response);
  return responseUtils.sendJson(response, user);
};

/**
 * Register new user and send created user back as JSON
 *
 * @param {http.ServerResponse} response Server's response
 * @param {object} userData JSON data from request body
 * @returns {http.ServerResponse} response
 */
const registerUser = async (response, userData) => {
  userData.role = 'customer';
  try {
    // user validation is handled by the database model
    const created = (await User.create(userData)).toJSON();
    return responseUtils.createdResource(response, created);
  }
  catch (e) {
    return responseUtils.badRequest(response, 'Email not valid or password too short');
  }
};

module.exports = { getAllUsers, registerUser, deleteUser, viewUser, updateUser };
