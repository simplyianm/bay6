"use strict";

var bodyParser = require("body-parser");
var express = require("express");
var http = require("http");
var methodOverride = require("method-override");
var mongoose = require("mongoose");
var restify = require("express-restify-mongoose");
var xtend = require("xtend");

var Auth = require("./auth");

module.exports = function() {
  return new Bay6();
};

function Bay6() {
  this._models = [];

  this.auth = new Auth();

  this.options = {
    prefix: "/api",
    version: ""
  };
}

/**
 * Serves this Bay6 instance on an Express server.
 * Ensure bodyParser.json() is enabled!
 *
 * @param {express} app - The app
 * @param conn - The Mongoose connection
 */
Bay6.prototype.serveExpress = function serveExpress(app, conn) {
  this.auth.setup(this, this.options.prefix + this.options.version);
  this._models.filter(function(model) {
    restify.serve(app, conn.model(model.name, model.schema), model.opts);
  });
};

/**
 * Serves this Bay6 instance with the default setup.
 *
 * @param {Number} port - The port of the server
 * @param {object} opts - Options
 */
Bay6.prototype.serve = function serve(port, opts) {
  port = port || 80;
  opts = opts || {};
  var mongoUri = opts.mongoUri || "mongodb://localhost/myapp";
  var publicDir = opts.publicDir || false;

  var app = this.express = express();

  // Misc middlewares
  app.use(bodyParser.json());
  app.use(methodOverride());
  if (publicDir) {
    app.use(express.static(publicDir));
  }

  // Mongoose connection
  var conn = this.mongoose = mongoose.createConnection(mongoUri);

  // The setup
  this.serveExpress(app, conn);

  // Create http server
  var httpServer = http.createServer(app);
  httpServer.listen(port);
  this.server = httpServer;
  return httpServer;
};
