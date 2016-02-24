'use strict';

var P         = require('bluebird');
var Couchbase = require('couchbase');

module.exports = {
  connect: connect
};

/*--------------------------------------------------------------------------------*/

function connect(options) {
  options = options || {};
  var cluster = new Couchbase.Cluster('couchbase://127.0.0.1');

  return P.resolve(cluster.openBucket('default'))
    .then(function (db) {
      /* Expose promise-based generic CRUD interface */
      return new CouchbaseCRUD(db);
    })
    .catch(function (err) {
      /* Return standardized database errors */
      return P.reject(err);
    });
}

/*--------------------------------------------------------------------------------*/

function CouchbaseCRUD(_db) {
  var db = Object.create(_db, {
    get:     {value: P.promisify(_db.get.bind(_db))},
    counter: {value: P.promisify(_db.counter.bind(_db))},
    insert:  {value: P.promisify(_db.insert.bind(_db))},
    upsert:  {value: P.reject},
    replace: {value: P.reject},
    remove:  {value: P.reject}
  });

  this.create = create.bind(db);
  this.read   = read.bind(db);
  this.update = update.bind(db);

  return this;
}

function create(key, value, options) {
  var db = this;
  options = options || {};

  return db.insert(key, value, options)
    .then(function (res) {
      return res.value;
    })
    .catch(handleCouchbaseError);
}

function read(key, options) {
  var db = this;
  options = options || {};

  return db.get(key, options)
    .then(function (res) {
      return res.value;
    });
}

function update(key, value, options) {
  var db = this;
  options = options || {};

  if (options.counter) {
    return db.counter(key, value, options)
      .then(function (res) {
        return res.value;
      });
  }  

  return db.upsert(key, value, options)
    .then(function (res) {
      return res.value;
    });
}

function handleCouchbaseError(err) {
  if (err.name === 'CouchbaseError' && err.code === 12) {
    return P.reject({
      name: 'key-already-exists'
    });
  }
  return P.reject(err);
}
