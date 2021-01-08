const http = require('http');
const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { getCurrentUser } = require('./auth/auth');
const { getAllUsers, registerUser, deleteUser, viewUser, updateUser } = require('./controllers/users');
const { getAllProducts, viewProduct, deleteProduct, updateProduct, createProduct } = require('./controllers/products');
const { getOrders, getOrder, postOrder } = require('./controllers/orders');

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  '/api/register': ['POST'],
  '/api/users': ['GET'],
  '/api/products': ['GET'],
  '/api/cart': ['GET']
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response Server's response
 * @returns {http.ServerResponse} response
 */
const sendOptions = (filePath, response) => {
  if (filePath in allowedMethods) {
    response.writeHead(204, {
      'Access-Control-Allow-Methods': allowedMethods[filePath].join(','),
      'Access-Control-Allow-Headers': 'Content-Type,Accept',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Expose-Headers': 'Content-Type,Accept'
    });
    return response.end();
  }

  return responseUtils.notFound(response);
};

/**
 * Process client request and send response accordingly
 * 
 * @param {http.ServerRequest} request Server's request
 * @param {http.ServerResponse} response Server's response
 * @returns {http.ServerResponse} response
 */
const handleRequest = async (request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;

  // serve static files from public/ and return immediately
  if (method.toUpperCase() === 'GET' && !filePath.startsWith('/api')) {
    const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
    return renderPublic(fileName, response);
  }
  if (method.toUpperCase() === 'OPTIONS') return sendOptions(filePath, response);

  switch (filePath) {
    case '/api/cart':
      if (method.toUpperCase() !== 'GET') return responseUtils.methodNotAllowed(response);
      return getAllProducts(response);

    case '/api/register': {
      if (method.toUpperCase() !== 'POST') return responseUtils.methodNotAllowed(response);
      if (!acceptsJson(request)) {
        return responseUtils.contentTypeNotAcceptable(response);
      }
      if (!isJson(request)) {
        return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
      }
      const user = await parseBodyJson(request);
      return registerUser(response, user);
    }
  }

  const currentUser = await getCurrentUser(request);
  const id = filePath.split('/')[3];

  switch (filePath) {
    case '/api/currentUserRole':
      if (method.toUpperCase() !== 'GET') return responseUtils.methodNotAllowed(response);
      if (!currentUser) return responseUtils.badRequest(response, 'No user is logged in.');
      return responseUtils.sendJson(response, currentUser.role);

    case '/api/users':
      if (method.toUpperCase() !== 'GET') return responseUtils.methodNotAllowed(response);
      if (!acceptsJson(request)) {
        return responseUtils.contentTypeNotAcceptable(response);
      }
      if (!currentUser) return responseUtils.basicAuthChallenge(response);
      if (currentUser.role === 'customer') return responseUtils.forbidden(response);
      
      return getAllUsers(response);
    
    case String(filePath.match(/^\/api\/users\/[0-9a-z]{8,24}$/)): {
      if (!currentUser) return responseUtils.basicAuthChallenge(response);
      if (currentUser.role === 'customer') return responseUtils.forbidden(response);
      if (!acceptsJson(request)) return responseUtils.contentTypeNotAcceptable(response);

      switch (method.toUpperCase()) {
        case 'GET':
          return viewUser(response, id);
        case 'PUT': {
          const data = await parseBodyJson(request);
          return updateUser(response, id, currentUser, data);
        }
        case 'DELETE':
          return deleteUser(response, id, currentUser);
        default:
          return responseUtils.methodNotAllowed(response);
      }
    }

    case '/api/products':
      if (method.toUpperCase() === 'GET') {
        if (!acceptsJson(request)) {
          return responseUtils.contentTypeNotAcceptable(response);
        }
        if (!currentUser) return responseUtils.basicAuthChallenge(response);

        return getAllProducts(response);
      }
      if (method.toUpperCase() === 'POST') {
        if (!acceptsJson(request)) {
          return responseUtils.contentTypeNotAcceptable(response);
        }
        if (!currentUser) return responseUtils.basicAuthChallenge(response);
        if (currentUser.role === 'customer') return responseUtils.forbidden(response);
        if (!isJson(request)) {
          return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
        }
        const product = await parseBodyJson(request);
        return createProduct(response, product);
      }
      return responseUtils.methodNotAllowed(response);
    
    case String(filePath.match(/^\/api\/products\/[0-9a-z]{8,24}$/)): {
      if (!currentUser) return responseUtils.basicAuthChallenge(response);
      if (!acceptsJson(request)) {
        return responseUtils.contentTypeNotAcceptable(response);
      }

      switch (method.toUpperCase()) {
        case 'GET':
          return viewProduct(response, id);
        case 'PUT': {
          if (currentUser.role === 'customer') return responseUtils.forbidden(response);
          const data = await parseBodyJson(request);
          return updateProduct(response, id, data);
        }
        case 'DELETE':
          if (currentUser.role === 'customer') return responseUtils.forbidden(response);
          return deleteProduct(response, id);
        default:
          return responseUtils.methodNotAllowed(response);
      }
    }

    case '/api/orders':
      switch (method.toUpperCase()) {
        case 'GET':
          if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
          }
          if (!currentUser) return responseUtils.basicAuthChallenge(response);
          return getOrders(response, currentUser);
        case 'POST': {
          if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
          }
          if (!currentUser) return responseUtils.basicAuthChallenge(response);
          if (currentUser.role === 'admin') return responseUtils.forbidden(response);
          if (!isJson(request)) {
            return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
          }
          const data = await parseBodyJson(request);
          return postOrder(response, data, currentUser);
        }
        default:
          return responseUtils.methodNotAllowed(response);
      }
    
    case String(filePath.match(/^\/api\/orders\/[0-9a-z]{8,24}$/)):
      if (method.toUpperCase() !== 'GET') responseUtils.methodNotAllowed(response);
      if (!currentUser) return responseUtils.basicAuthChallenge(response);
      if (!acceptsJson(request)) {
        return responseUtils.contentTypeNotAcceptable(response);
      }
      return getOrder(response, id, currentUser);
    
    default:
      return responseUtils.notFound(response);
  }
};

module.exports = { handleRequest };
