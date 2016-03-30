'use strict';

var elliptic = require('elliptic');

module.exports = {
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
