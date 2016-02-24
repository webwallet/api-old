'use strict';

var P = require('bluebird');

module.exports = {
  address:     {
    balance:   readAddressBalance
  },
  currency:    {
    supply:    readCurrencySupply
  },
  transaction: {
    request:   readTransactionRequest,
    record:    readTransactionRecord,
    history:   readTransactionHistory
  }
};

/*--------------------------------------------------------------------------------*/

function readAddressBalance() {
  var db = this;
  return P.resolve();
}

function readCurrencySupply() {
  var db = this;
  return P.resolve();
}

function readTransactionRequest() {
  var db = this;
  return P.resolve();
}

function readTransactionRecord() {
  var db = this;
  return P.resolve();
}

function readTransactionHistory() {
  var db = this;
  return P.resolve();
}
