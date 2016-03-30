'use strict';

var endpoint = '/address';
var P        = require('bluebird');

module.exports = {
  GET: getAddressBalance
};

/*--------------------------------------------------------------------------------*/

function getAddressBalance(request) {

  return DB.read.address.balance(request)
    .then(function (response) {
      return {
        status: response.status,
        body: {
          data: response.data,
          error: response.error,
          entities: [],
          actions: [],
          links: []
        }
      };
    });
}

/*--------------------------------------------------------------------------------*/
