'use strict';

module.exports = function (type, code, message) {
  return {
    error: {
      name: (errors[type] || errors.http)[code] || errors['default'],
      message: message
    }
  }
}; 

var errors = {
  http: {
    '400': 'bad-request'
  },
  default: 'internal-server-error'
};
