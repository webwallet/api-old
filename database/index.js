'use strict';

var P          = require('bluebird');
var driver     = require('./drivers/couchbase');
var init       = require('./operations/init');

var databaseOperations = {
  create: require('./operations/create'),
  read:   require('./operations/read'),
  update: require('./operations/update'),
  delete: require('./operations/delete')
};

module.exports = {
  connect: connectToDatabase
};

/*--------------------------------------------------------------------------------*/

function connectToDatabase(options) {
  return driver.connect(options)
    .then(function (db) {
      /* Bind database operations to the db object */
      return init.call(db, options)
        .then(function () {
          return bindOperations(db, databaseOperations);
        })
        .catch(function () {
          return bindOperations(db, databaseOperations);
        });
    });
}

function bindOperations(db, operation) {
  if (typeof operation !== 'object') {
    if (typeof operation === 'function') {
      return operation.bind(db);
    }
    return operation;
  }

  var operations = {};
  for (var key in operation) {
    operations[key] = bindOperations(db, operation[key]);
  }
  return operations;
}

/*--------------------------------------------------------------------------------*/
