'use strict';

function AddressTransaction() {
  return {
    hash: {
      type: 'sha256',
      value: ''
    },
    payload: {
      count: 0,
      address: null,
      balance: '0',
      currency: null,
      limits: {
        lower: '0',
        upper: null
      },
      transaction: {
        count: null,
        index: null,
        delta: null,
        hash: null
      },
      previous: null,
      timestamp: null
    },
    signatures: []
  };
}

module.exports = AddressTransaction;