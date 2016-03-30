'use strict';

var crypto    = require('crypto');
var elliptic  = require('elliptic');
var ripemd160 = require('ripemd160');
var bs58check = require('bs58check');
var P         = require('bluebird');
var _         = require('lodash');

var config = require('../config');
var common = require('../common');
var dbkeys = require('../keyingScheme.json');
var templates = require('../../templates');

module.exports = {
  record: createWalletAddress,
  transaction: {
    record: createTransactionRecord
  }
};

/*--------------------------------------------------------------------------------*/


function createWalletAddress(request) {
  var db = this;
  var jws = request.params.body;
  var keys = jws.payload.keys;
  var addressType = jws.payload.address[0] === 'c' ? 'issuer' : 'bearer'; 
  var address = generateWalletAddress(keys, addressType);

  /* Request hash validation */
  var validation = common.validate.hash(jws, address);
  if (validation && validation.error) {
    return {error: validation.error, info: validation}
  }
  if (address !== jws.payload.address) {
    return {status: 400, error: 'invalid-address'};
  }

  /* Request structure validation */
  if (jws.payload.threshold > keys.length) {
    return {error: 'invalid-address-threshold'};
  } else if (jws.signatures.length < keys.length) {
    return {error: 'missing-address-signatures'};
  }

  /* Request signature verification */
  var verification = _.map(jws.signatures, function (signature, index) {
    return common.verify.signature(jws.hash.value, signature, keys[index])
  });
  if (_.countBy(verification).true < keys.length) {
    return {error: 'signature-verification-error', info: verification};
  }

  /* Document keys */
  var addressDocumentKey = dbkeys.address.document
    .replace('{address}', address);
  var transactionCounterKey = dbkeys.address.transaction.counter
    .replace('{address}', address);
  var transactionDocumentKey = dbkeys.address.transaction.document
    .replace('{address}', address)
    .replace('{count}', 0);

  /* Document values */
  var transactionCounter = 0;
  var transactionDocument = createTransactionGenesis(address, addressType);

  return P.all([
      /* Create address document */
      db.create(addressDocumentKey, jws),
      /* Create transaction counter */
      db.create(transactionCounterKey, transactionCounter),
      /* Create transaction document */
      db.create(transactionDocumentKey, transactionDocument)
    ])
    .then(function () {
      return jws;
    })
    .catch(function (error) {
      return {status: 400, error: error}
    })
}

function createTransactionRecord() {
  
}

/*--------------------------------------------------------------------------------*/

function generateWalletAddress(publicKeys, addressType) {
  var prefix = config.defaults.prefix[addressType] || config.defaults.prefix.bearer;
  var keyBuffer = new Buffer(publicKeys[0], 'hex');
  var firstHash = crypto.createHash(config.defaults.digest).update(keyBuffer).digest();
  var secondHash = ripemd160(firstHash);
  var extendedHash = prefix + secondHash.toString('hex');
  var base58Public = bs58check.encode(new Buffer(extendedHash, 'hex'));

  return base58Public;
}

function createTransactionGenesis(address, type) {
  var transactionDocument = templates.address.transaction();
  transactionDocument.payload.address = address;
  if (type === 'issuer') {
    transactionDocument.payload.currency = address.substr(0, 10);
    transactionDocument.payload.limits = {
      lower: null,
      upper: '0'
    };
  }
  return transactionDocument;
}
