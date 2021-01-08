const http = require('http');
const { getCredentials } = require("../utils/requestUtils");
const User = require('../models/user');

/**
 *  Get current user based on the request headers
 * 
 * @param {http.IncomingMessage} request Incoming message
 * @returns {object|null} current authenticated user
 * or null if not yet authenticated
 */
const getCurrentUser = async request => {
  // TODO: 9.4 Implement getting current user based on the "Authorization" request header
  const credentials = getCredentials(request);
  if (!credentials || !credentials[0] || !credentials[1]) return null;
  const user = await User.findOne({ email: credentials[0] });
  if (!user) return null;
  const match = await user.checkPassword(credentials[1]);
  if (!match) return null;
  return user;
};

module.exports = { getCurrentUser };
