'use strict';

var P      = require('bluebird');
var _      = require('lodash');
var BigNumber = require('bignumber.js');

var common = require('../common');
var dbkeys = require('../keyingScheme.json');

module.exports = {
  request: createTransactionRequest,
  record:  createTransactionRecord
};

/*--------------------------------------------------------------------------------*/

function createTransactionRequest(request) {
  var db = this;
  var jws = request.params.body;

  /* Request body validation */
  var validation = common.validate.hash(jws);
  if (validation && validation.error) {
    return P.resolve(validation);
  }

  return P.map([jws.payload.sub], function (address) {
      return db.read(dbkeys.address.document.replace('{address}', address))
        .then(function (address) {
          /* Verify integrity */
          return address.payload;
        })
        .then(function (address) {
          /* Verify signatures */
          var signatures = [];
          if (address.keys.length === 1) {
            signatures.push(_.find(jws.signatures, {header: {kid: address.address}}));
          } else {
            for (let index in address.keys) {
              signatures.push(_.find(jws.signatures, {header: {kid: address.address + ':' + index}}));
            }
          }

          var verification = _.map(signatures, function (signature, index) {
            return common.verify.signature(jws.hash.value, signature, address.keys[index]);
          })
          var trues = _.countBy(verification).true;
          if (!trues || trues < address.threshold) {
            return P.reject({error: 'signature-verification-failed', info: verification});
          }
          return true;
        })
    })
    .spread(function (sourceSignatures) {
      if (!sourceSignatures) {
        return P.reject({error: 'missing-source-signatures'});
      }

      return db.create(dbkeys.iou.document.replace('{hash}', jws.hash.value), jws)
        .then(function () {
          return createTransactionRecord.call(db, jws);
        })
        .catch(function (err) {
          err.name = (err.name === 'key-already-exists') ? 'iou-cleared-before' : err;
          return {
            error: err
          };
        });
    });
}

function createTransactionRecord(jws) {
  var db = this;
  var counters = {};

  /* Document keys */
  var sourceTransactionCounter = dbkeys.address.transaction.counter
    .replace('{address}', jws.payload.sub);
  var destinationTransactionCounter = dbkeys.address.transaction.counter
    .replace('{address}', jws.payload.aud);
  /* Document values */
  var newSourceTransaction;
  var newDestinationTransaction;


  return P.map([
      sourceTransactionCounter,
      destinationTransactionCounter
    ], function (transactionCounterKey) {
      return db.read(transactionCounterKey)
        .then(function (transactionCount) {
          counters[transactionCounterKey] = transactionCount;
          return db.read(transactionCounterKey + '::' + transactionCount);
        })
        .then(function (latestTransaction) {
          /* Verify integrity */
          return latestTransaction;
        })
    })
    .spread(function (source, destination) {
      return computeBalances(source.payload, destination.payload, jws.payload.amt)
        .spread(function (newSourceBalance, newDestinationBalance) {
          if (source.payload.balance === newSourceBalance ||
              destination.payload.balance === newDestinationBalance) {
            return P.reject({error: 'balance-computation-failed'});
          }
          source.payload.balance = newSourceBalance;
          destination.payload.balance = newDestinationBalance;
          newSourceTransaction = source;
          newDestinationTransaction = destination;
        });
    })
    .then(function () {
      return P.map([
          sourceTransactionCounter,
          destinationTransactionCounter
        ], function (transactionCounterKey) {
          return db.update(transactionCounterKey, 1, {counter: true})
            .then(function (transactionCount) {
              if (transactionCount - counters[transactionCounterKey] > 1 ) {
                return P.reject({error: 'race-condition-found'});
              }
              return transactionCount;
            });
        })
      .spread(function (sourceTransactionCount, destinationTransactionCount) {
        var newSourceTransactionKey = sourceTransactionCounter + '::' + sourceTransactionCount;
        var newDestinationTransactionKey = destinationTransactionCounter + '::' + destinationTransactionCount;

        return db.create(newSourceTransactionKey, newSourceTransaction)
          .then(function (res) {
            return db.create(newDestinationTransactionKey, newDestinationTransaction);
          })
      })
      .then(function () {
        return P.resolve({
          data: {
            status: 'cleared'
          }
        })
      })
    });
}

/*--------------------------------------------------------------------------------*/

function computeBalances(source, destination, amount) {
  try {
    var sourceLowerLimit = new BigNumber(source.limits.lower || -Infinity);
    var destinationUpperLimit = new BigNumber(destination.limits.upper || Infinity);
    var newSourceBalance = (new BigNumber(source.balance)).minus(amount);
    var newDestinationBalance = (new BigNumber(destination.balance)).plus(amount);
  } catch (e) {
    return P.reject(e);
  }

  if (destination.currency === null) {
    destination.currency = source.currency;
  } else if (source.currency !== destination.currency) {
    return P.reject('currency-mismatch');
  }

  var nullLowerLimit = sourceLowerLimit === null;
  var nullUpperLimit = destinationUpperLimit === null;

  if (!nullLowerLimit && !newSourceBalance.gte(sourceLowerLimit)) {
    return P.reject({error: 'unavailable-funds'});
  }
  if (!nullUpperLimit && !newDestinationBalance.lte(destinationUpperLimit)) {
    return P.reject({error: 'unreceivable-funds'});
  }

  return P.resolve([newSourceBalance.toString(), newDestinationBalance.toString()]);
}
