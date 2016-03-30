'use strict';

var P = require('bluebird');
var _ = require('lodash');

var dbkeys = require('../../keyingScheme.json');

module.exports = readAddressBalance;

/*--------------------------------------------------------------------------------*/

function readAddressBalance(request) {
  var db = this;

  /* Document keys */
  var transactionCounterKey = dbkeys.address.transaction.counter
    .replace('{address}', request.params.address);
  var transactionDocumentKey = dbkeys.address.transaction.document
    .replace('{address}', request.params.address);


  return db.read(transactionCounterKey)
    .then(function (transactionCount) {
      return db.read(transactionDocumentKey.replace('{count}', transactionCount))
        .then(function (latestTransaction) {
          /* Verify integrity */
          return {
            data: _.pick(latestTransaction.payload, ['balance', 'currency', 'limits'])
          };
        })
    });
}
