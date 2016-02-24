'use strict';

var P = require('bluebird');

var dbkeys = require('../keyingScheme.json');

module.exports = initializeDatabase;

var keys = [
  {name: dbkeys.counters.currency, value: 0}  
];

/*--------------------------------------------------------------------------------*/

function initializeDatabase(config) {
  var db = this;

  return P.each(keys, function (key) {
    return db.create(key.name, key.value)
  });
}
