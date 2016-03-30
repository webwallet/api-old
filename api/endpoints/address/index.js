'use strict';

var endpoint = '/address';
var P        = require('bluebird');

module.exports = {
  POST: postWalletAddress
};

/*--------------------------------------------------------------------------------*/

var prefixes = ['w'];

function postWalletAddress(request) {
  if(prefixes.indexOf(request.params.body.payload.address[0]) < 0) {
    return P.resolve({
      status: 400,
      body: {
        error: 'invalid-address'
      }
    });
  }

  return DB.create.address.record(request)
    .then(function (response) {
      return {
        status: response.status,
        body: {
          data: {
            address: response.payload.address
          },
          error: response.error,
          entities: [],
          actions: [],
          links: []
        }
      };
    });
}

/*--------------------------------------------------------------------------------*/
