'use strict';

function CurrencyTransaction() {
  return {
    hash: {
      type: 'sha256',
      value: ''
    },
    payload: {
      count: 0,
      amount: null,
      currency: {
        code: null,
        issuer: null,
        supply: 0,
        credit: null,
        ceiling: null,
        delta: null
      },
      inputs: [],
      outputs: [],
      previous: null
    },
    signatures: []
  };
}

module.exports = CurrencyTransaction;