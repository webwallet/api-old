'use strict';

var crypto = require('crypto');
var config = require('./config');

module.exports = {
  validate: {
    hash: validateHash
  },
  verify: {
    signature: verifySignature,
    signatures: verifySignatures
  }
};

/*--------------------------------------------------------------------------------*/

function validateHash(jws, address) {
  if (config.validHashes.indexOf(jws.hash.type) < 0) {
    return {status: 400, error: 'invalid-hash-type'};
  }
  var hash = crypto.createHash(jws.hash.type).update(JSON.stringify(jws.payload)).digest('hex');
  if (hash !== jws.hash.value) {
    return {status: 400, error: 'invalid-hash-value'};
  }
}

function verifySignature(hash, signature, publicKey) {
  if (!signature) {
    return {error: 'invalid-signature-object'};
  }

  var valid;
  var scheme = config.cryptoSchemes[signature.header.alg];
  if (!scheme) {
    return {status: 400, error: 'invalid-signature-algorithm'};
  }
  if (!publicKey) {
    return {status: 400, error: 'missing-public-key'};
  }

  try {
    valid = scheme.verify(hash, signature.signature, publicKey, 'hex');
  } catch(e) {
    return {status: 400, error: 'invalid-signature'};
  }

  if (!valid) {
    return {status: 400, error: 'invalid-signature'};
  }

  return true;
}

function verifySignatures(jws, publicKeys) {
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
    publicKey = publicKeys[signature.header.kid];
    if (!publicKey) {
      return {status: 400, error: 'missing-public-key'};
    }
    
    try {
      valid = scheme.verify(jws.hash.value, signature.signature, publicKey, 'hex');
    } catch(e) {
      return {status: 400, error: 'invalid-signature'};
    }

    if (!valid) {
      return {status: 400, error: 'invalid-signature'};
    }
  }

  return true;
}
