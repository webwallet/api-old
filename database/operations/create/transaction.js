'use strict';

var keys = require('../keyingScheme.json');

module.exports = {
  request: createTransactionRequest,
  record:  createTransactionRecord
};

/*--------------------------------------------------------------------------------*/

function createTransactionRequest() {
  var db = this;
  return P.resolve();
}

function createTransactionRecord() {
  var db = this;
  return P.resolve();
}
