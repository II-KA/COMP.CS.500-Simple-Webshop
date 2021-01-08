const http = require('http');

/**
 * Decode, parse and return user credentials (username and password)
 * from the Authorization header.
 *
 * @param {http.incomingMessage} request The incoming message
 * @returns {Array|null} [username, password] or null if header is missing
 */
const getCredentials = request => {
  // TODO: 8.4 Parse user credentials from the "Authorization" request header
  // NOTE: The header is base64 encoded as required by the http standard.
  //       You need to first decode the header back to its original form ("email:password").
  //  See: https://attacomsian.com/blog/nodejs-base64-encode-decode
  //       https://stackabuse.com/encoding-and-decoding-base64-strings-in-node-js/
  if (!request.headers['authorization']) return null;
  const [type, encoded] = request.headers['authorization'].split(" ");
  if (type !== 'Basic') return null;

  const buff = Buffer.from(encoded, 'base64');
  const decoded = buff.toString('ascii');

  const [email, password] = decoded.split(':');
  return [email, password];
};

/**
 * Does the client accept JSON responses?
 *
 * @param {http.incomingMessage} request The incoming message
 * @returns {boolean} true if request.headers accepts 
 * 'application/json' or all
 */
const acceptsJson = request => {
  // NOTE: "Accept" header format allows several comma separated values simultaneously
  // as in "text/html,application/xhtml+xml,application/json,application/xml;q=0.9,*/*;q=0.8"
  // Do not rely on the header value containing only single content type!
  if (!('accept' in request.headers)) return false;
  const text = request.headers.accept;
  return text.includes('application/json') || text.includes('*/*'); 
};

/**
 * Is the client request content type JSON?
 *
 * @param {http.incomingMessage} request The incoming message
 * @returns {boolean} false if content-type isn't 'application/json'
 */
const isJson = request => {
  return request.headers['content-type'] === 'application/json';
};

/**
 * Asynchronously parse request body to JSON
 *
 * Remember that an async function always returns a Promise which
 * needs to be awaited or handled with then() as in:
 *
 *   const json = await parseBodyJson(request);
 *
 *   -- OR --
 *
 *   parseBodyJson(request).then(json => {
 *     // Do something with the json
 *   })
 *
 * @param {http.IncomingMessage} request The incoming message
 * @returns {Promise<*>} Promise resolves to JSON content of the body
 */
const parseBodyJson = request => {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('error', err => reject(err));

    request.on('data', chunk => {
      body += chunk.toString();
    });

    request.on('end', () => {
      resolve(JSON.parse(body));
    });
  });
};

module.exports = { acceptsJson, getCredentials, isJson, parseBodyJson };
