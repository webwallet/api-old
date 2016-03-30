'use strict';

var P      = require('bluebird');
var uid2   = require('uid2');
var create = {
  address: require('./address')
}

var dbkeys     = require('../keyingScheme.json');
var templates = require('../../templates');

module.exports = {
  record: createCurrencyUnit,
  transaction: {
    record: createTransactionRecord
  }
};

/*--------------------------------------------------------------------------------*/

function createCurrencyUnit(request) {
  var db = this;
  var jws;

  return create.address.record.call(db, request)
    .then(function (_jws) {
      jws = _jws;
      var address = jws.payload.address;
      var currency = address.substr(0, 10);

      /* Document keys */
      var currencyDocumentKey = dbkeys.currency.document
        .replace('{currency}', currency);
      var addressCounterKey = dbkeys.currency.address.counter
        .replace('{currency}', currency);
      var issuerAddressLookupKey = dbkeys.currency.address.lookup
        .replace('{currency}', currency)
        .replace('{count}', 1);
      var transactionRequestCounterKey = dbkeys.currency.transaction.request.counter
        .replace('{currency}', currency);
      var transactionRecordCounterKey = dbkeys.currency.transaction.record.counter
        .replace('{currency}', currency);
      var transactionDocumentKey = dbkeys.currency.transaction.record.document
        .replace('{currency}', currency)
        .replace('{count}', 0);

      /* Document values */
      var addressCounterValue = 1;
      var transcationRequestCounterValue = 0;
      var transcationRecordCounterValue = 0;
      var transactionDocument = createTransactionGenesis(address, currency);
      var issuerLookupDocument = createLookupDocument(issuerAddressLookupKey, address);

      return db.update(dbkeys.counters.currency, 1, {counter: true}).then(function (count) {
        var currencyLookupKey = dbkeys.currency.lookup.replace('{count}', count);

        return P.all([
          db.create(
            currencyLookupKey, 
            createLookupDocument(currencyLookupKey, currency)
          ),
          db.create(addressCounterKey, addressCounterValue),
          db.create(issuerAddressLookupKey, issuerLookupDocument),
          db.create(transactionRequestCounterKey, transcationRequestCounterValue),
          db.create(transactionRecordCounterKey, transcationRecordCounterValue),
          db.create(transactionDocumentKey, transactionDocument)
        ])
      });
    })
    .then(function () {
      return jws;
    });
}

function createTransactionRecord() {
  
}

/*--------------------------------------------------------------------------------*/

function createLookupDocument(key, value) {
  var jws = {
    hash: {},
    payload: {
      key: key,
      value: value
    },
    signatures: []
  };

  return jws;
}

function createTransactionGenesis(address, currency) {
  var transactionDocument = templates.currency.transaction();
  transactionDocument.payload.currency.code = currency;
  transactionDocument.payload.currency.issuer = address;
  return transactionDocument;
};
