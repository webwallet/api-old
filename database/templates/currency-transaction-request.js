'use strict';

function CurrencyTransactionRequest() {
  return {
    hash: {
      type: 'sha256',
      value: ''
    },
    payload: {
      count: 0,
      amount: null,
      currency: '',
      state: '',
      inputs: [],
      outputs: []
    },
    signatures: []
  };
}

module.exports = CurrencyTransactionRequest;