'use strict';

var endpoint = '/address';
var P        = require('bluebird');

module.exports = {
  POST: postCurrencyUnit
};

/*--------------------------------------------------------------------------------*/

var prefixes = ['c'];

function postCurrencyUnit(request) {
  if(prefixes.indexOf(request.params.body.payload.address[0]) < 0) {
    return P.resolve({
      status: 400,
      body: {
        error: 'invalid-address'
      }
    });
  }

  return DB.create.currency.record(request)
    .then(function (response) {
      return {
        status: response.status,
        body: {
          properties: response.body || {error: response.error},
          entities: [],
          actions: [],
          links: []
        }
      };
    });
}

/*--------------------------------------------------------------------------------*/
