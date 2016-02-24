'use strict';

var endpoint = '/transaction';
var GET      = 'GET';
var PUT      = 'PUT';
var POST     = 'POST';
var DELETE   = 'DELETE';
var P        = require('bluebird');

module.exports = {
  POST:  postTransaction
};

/*--------------------------------------------------------------------------------*/

function postTransaction(request) {  
  return P.resolve({
    properties: {},
    entities: [],
    actions: [],
    links: []
  });
}

/*--------------------------------------------------------------------------------*/
