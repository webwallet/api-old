'use strict';

var _ = require('lodash');

var handlers = {
  '/address': require('./address'),
  '/address/.../balance': require('./address/balance'),
  '/currency': require('./currency'),
  '/transaction': require('./transaction')
};

module.exports = {
  'address.post':       handle('POST', '/address'),
  'address.balance.get': handle('GET', '/address/.../balance'),
  'currency.post':      handle('POST', '/currency'),
  'transaction.post':   handle('POST', '/transaction')
};

/*--------------------------------------------------------------------------------*/

var bodyProperties = ['hash', 'payload', 'signatures'];
var hashProperties = ['type', 'value'];
var signaturesProperties = ['header', 'signature'];

function handle(method, endpoint) {
  var handler = handlers[endpoint];
  if (typeof handler !== 'object' || typeof handler[method] !== 'function') {
    throw new Error('Missing endpoint handler: ' + endpoint);
  }

  return function (req, res) {
    /* Message composition */
    var message = {
      method: method,
      endpoint: endpoint,
      params: {}
    };

    /* Parameter parsing */
    var params = req.swagger.params;
    for (let param in params) {
      message.params[param] = params[param].value;
    }

    /* Body filtering */
    if (typeof message.params.body === 'object') {
      var body = _.pick(message.params.body, bodyProperties);
      body.hash = _.pick(body.hash, hashProperties);
      body.signatures = body.signatures || [];
      for (let index in body.signatures) {
        body.signatures[index] = _.pick(body.signatures[index], signaturesProperties);
      }
      message.params.body = body;
    }

    return handler[method](message)
      .then(function (response) {
        res.status(response.status || 200).json(response.body).end();
      });
  }
}
