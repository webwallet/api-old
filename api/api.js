'use strict';

var http = require('http');
var cors = require('cors');
var yamljs = require('yamljs');
var swagger = require('swagger-tools');
var express = require('express');

var api = express();
var db = require('../database');
var swaggerObject = yamljs.load('./api/swagger/swagger.yaml');

module.exports = api;

swagger.initializeMiddleware(swaggerObject, function (middleware) {
  api.use(cors());
  api.use(middleware.swaggerMetadata());
  api.use(middleware.swaggerValidator());
  api.use(middleware.swaggerRouter({controllers: './api/endpoints'}));
  api.use(middleware.swaggerUi());
  api.use(handleErrors);
  api.all('*', function (req, res, next) {
    res.status(405).json({
      message: 'Unsupported request.'
    }).end();
  });

  var port = process.env.PORT || 8080;
  db.connect().then(function (_db) {
    global.DB = _db;
    http.createServer(api).listen(port, '0.0.0.0', function () {
      console.log('API server running on port %s', port);
    });
  });
});

function handleErrors(err, req, res, next) {
  if (err && typeof err === 'object') {
    Object.defineProperty(err, 'message', { enumerable: true });
    if (err.allowedMethods) {
    /* Reply 405 Method not allowed */
      res.status(405);
      err.message = 'Unsupported ' + req.method +' request.';
    }
    console.error(err);
    res.status(500).json(err).end();
  } else {
    res.json({
      message: 'Unsupported request.'
    });
  }
}
