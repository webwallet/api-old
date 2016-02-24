'use strict';

var crypto    = require('crypto');
var elliptic  = require('elliptic');
var ripemd160 = require('ripemd160');
var bs58check = require('bs58check');
var P         = require('bluebird');
var _         = require('lodash');

var dbkeys = require('../keyingScheme.json');
var templates = require('../../templates');

module.exports = {
  record: createWalletAddress,
  transaction: {
    record: createTransactionRecord
  }
};

/*--------------------------------------------------------------------------------*/

var config = {
  validHashes: ['sha256'],
  defaults: {
    scheme: 'ed25519',
    prefix: {
      issuer: '57',
      bearer: '87'
    },
    digest: 'sha256'
  },
  cryptoSchemes: {
    'secp256k1': new elliptic.ec('secp256k1'),
    'ed25519': new elliptic.ec('ed25519')
  }
};

function createWalletAddress(request) {
  var db = this;
  var jws = request.params.body;
  var addressType = jws.payload.address[0] === 'c' ? 'issuer' : 'bearer'; 
  var address = generateWalletAddress(jws.payload.keys, addressType);

  /* Request body validation */
  var validation = validateBody(jws, address);
  if (validation && validation.error) {
    return P.resolve(validation);
  }

  /* Request signature verification*/
  var verification = verifySignatures(jws);
  if (verification && verification.error) {
    return P.resolve(verification);
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

function validateBody(jws, address) {
  if (config.validHashes.indexOf(jws.hash.type) < 0) {
    return {status: 400, error: 'invalid-hash-type'};
  }
  var hash = crypto.createHash(jws.hash.type).update(JSON.stringify(jws.payload)).digest('hex');
  if (hash !== jws.hash.value) {
    return {status: 400, error: 'invalid-hash-value'};
  }
  if (address !== jws.payload.address) {
    return {status: 400, error: 'invalid-address'};
  }
}

function verifySignatures(jws) {
  var valid;
  var signature;
  var scheme;
  var publicKey;

  for (let index in jws.signatures) {
    valid = false;
    signature = jws.signatures[index];

    scheme = config.cryptoSchemes[signature.header.alg];
    if (!scheme) {
      return {status: 400, error: 'invalid-signature-algorithm'};
    }
    publicKey = jws.payload.keys[signature.header.kid];
    if (!publicKey) {
      return {status: 400, error: 'missing-public-key'};
    }
    
    try {
      valid = scheme.verify(jws.hash.value, signature.signature, publicKey, 'hex');
    } catch(e) {
      return {status: 400, error: 'invalid-signature'};
    } finally {
      if (!valid) {
        return {status: 400, error: 'invalid-signature'};
      }
    }
  }
}

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
    transactionDocument.payload.currency = address.substr(1, 10);
    transactionDocument.payload.limits = {
      lower: null,
      upper: '0'
    };
  }
  return transactionDocument;
}
