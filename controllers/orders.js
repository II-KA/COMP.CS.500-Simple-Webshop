const http = require('http');
const responseUtils = require('../utils/responseUtils');
const Order = require('../models/order');

/**
 * Send all orders as JSON for admins. In case of a customer
 * send its own orders as JSON.
 * 
 * @param {http.ServerResponse} response Server's response
 * @param {object} currentUser (mongoose document object)
 * @returns {http.ServerResponse} response
 */
const getOrders = async (response, currentUser) => {
    if (currentUser.role === 'admin') {
        const orders = await Order.find().select('-__v').lean();
        return responseUtils.sendJson(response, orders);
    }
    if (currentUser.role === 'customer') {
        const orders = await Order.find({ customerId: currentUser._id }).select('-__v').lean();
        return responseUtils.sendJson(response, orders);
    }
};

/**
 *  * Send order data as JSON
 *
 * @param {http.ServerResponse} response Server's response
 * @param {string} id Id of a order
 * @param {object} currentUser (mongoose document object)
 * @returns {http.ServerResponse} response
 */
const getOrder = async (response, id, currentUser) => {
    const order = await Order.findOne({ _id: id }).select('-__v').lean();
    if (!order) return responseUtils.notFound(response);
    // return order for customers only if it's their own
    if (currentUser.role === 'customer' && String(order.customerId) !== String(currentUser._id)) {
        return responseUtils.notFound(response);
    }
    return responseUtils.sendJson(response, order);
};

/**
 * Validate order object
 * This function can be used to validate that order has all required
 * fields before saving it.
 *
 * @param {object} data order object to be validated
 * @returns {Array<string>} Array of error messages
 * or empty array if user is valid
 */
const validateData = data => {
    const ErrorArray = [];
    if (data.items.length <= 0) ErrorArray.push('Items are empty');
    data.items.forEach(item => {
        if (!('quantity' in item)) ErrorArray.push('Missing quantity');
        if (!('product' in item)) {
            ErrorArray.push('Missing product');
            return;
        }
        if (!('_id' in item.product)) ErrorArray.push('Missing _id');
        if (!('name' in item.product)) ErrorArray.push('Missing name');
        if (!('price' in item.product)) ErrorArray.push('Missing price');
    });
    return ErrorArray;
  };

/**
 * Create new order and send created order back as JSON
 *
 * @param {http.ServerResponse} response Server's response
 * @param {object} data JSON data from request body
 * @param {object} currentUser (mongoose document object)
 * @returns {http.ServerResponse} response
 */
const postOrder = async (response, data, currentUser) => {
    if (validateData(data).length !== 0) {
        return responseUtils.badRequest(response, 'value missing');
    }
    try {
        const order = (await Order.create({ customerId: currentUser._id, items: data.items })).toJSON();
        return responseUtils.createdResource(response, order);
    }
    catch (e) {
        return responseUtils.badRequest(response, 'Order data is lacking.');
    }
};

module.exports = { getOrders, getOrder, postOrder };