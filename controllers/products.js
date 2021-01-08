const http = require('http');
const responseUtils = require('../utils/responseUtils');
const Product = require('../models/product');

/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response Server's response
 * @returns {http.ServerResponse} response
 */
const getAllProducts = async response => {
  const product = await Product.find().select('-__v').lean();
  return responseUtils.sendJson(response, product);
};

/**
 * Send product data as JSON
 *
 * @param {http.ServerResponse} response Server's response
 * @param {string} id Id of a product
 * @returns {http.ServerResponse} response
 */
const viewProduct = async (response, id) => {
  const product = await Product.findOne({ _id: id }).select('-__v').lean();
  if (!product) return responseUtils.notFound(response);
  return responseUtils.sendJson(response, product);
};

/**
 * Update product and send updated product as JSON
 *
 * @param {http.ServerResponse} response Server's response
 * @param {string} id Id of a product
 * @param {object} data JSON product data from request body
 * @returns {http.ServerResponse} response
 */
const updateProduct = async (response, id, data) => {
  if ('price' in data && (isNaN(data.price) || data.price <= 0)) {
     return responseUtils.badRequest(response, 'Price should be a positive number.');
  }
  if ('name' in data && data.name.length === 0) {
    return responseUtils.badRequest(response, 'Name should be defined.');
  }
  const updated = await Product.findOneAndUpdate({ _id: id }, data, { new: true }).select('-__v').lean();
  if (!updated) return responseUtils.notFound(response);
  return responseUtils.sendJson(response, updated);
};

/**
 * Delete product and send deleted product as JSON
 *
 * @param {http.ServerResponse} response Server's response
 * @param {string} id Id of a product
 * @returns {http.ServerResponse} response
 */
const deleteProduct = async (response, id) => {
  const deleted = await Product.findOneAndDelete({ _id: id }).select('-__v').lean();
  if (!deleted) return responseUtils.notFound(response);
  return responseUtils.sendJson(response, deleted);
};

/**
 * Create new product and send created product back as JSON
 *
 * @param {http.ServerResponse} response Server's response
 * @param {object} data JSON product data from request body
 * @returns {http.ServerResponse} response
 */
const createProduct = async (response, data) => {
  if (!('name' in data) || !('price' in data)) {
    return responseUtils.badRequest(response, 'Name or price missing.');
  }
  try {
    const created = (await Product.create(data)).toJSON();
    return responseUtils.createdResource(response, created);
  }
  catch (e) {
    return responseUtils.badRequest(response, 'Price should be greater than 0.');
  }
};

module.exports = { getAllProducts, viewProduct, deleteProduct, updateProduct, createProduct };
