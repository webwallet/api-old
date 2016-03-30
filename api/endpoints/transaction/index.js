'use strict';

var endpoint = '/transaction';
var GET      = 'GET';
var PUT      = 'PUT';
var POST     = 'POST';
var DELETE   = 'DELETE';
var P        = require('bluebird');

module.exports = {
  POST:  postTransactionRequest
};

/*--------------------------------------------------------------------------------*/

function postTransactionRequest(request) {
  return DB.create.transaction.request(request)
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
