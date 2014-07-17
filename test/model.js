"use strict";

var async = require("async");
var bay6 = require("../lib/");
var expect = require("chai").expect;
var mongoose = require("mongoose");
var request = require("supertest");

describe("Model", function() {
  var app;
  var server;
  var model;

  beforeEach(function() {
    app = bay6();
    app.options.prefix = "";
    model = app.model("Document", {
      title: String,
      contents: String
    });
  });

  describe("#limit", function() {
    it("should return all documents if too high", function(done) {
      model.limit(10);

      populateAndGet(function(err, res) {
        expect(res.body.length).to.equal(6);
        done();
      });
    });

    it("should return all documents if the same number", function(done) {
      model.limit(6);

      populateAndGet(function(err, res) {
        expect(res.body.length).to.equal(6);
        done();
      });
    });

    it("should return a maximum of n documents", function(done) {
      model.limit(5);

      populateAndGet(function(err, res) {
        expect(res.body.length).to.equal(5);
        done();
      });
    });
  });

  afterEach(function(done) {
    app.mongoose.db.dropDatabase(done);
    server.close();
  });

  function populateAndGet(cb) {
    server = app.serve(9000);
    var Document = app.mongoose.model("Document");
    async.each([1, 2, 3, 4, 5, 6], function(useless, done2) {
      var doc = new Document({
        title: "war and peace",
        contents: "yolo"
      });
      doc.save(done2);
    }, function(err) {
      if (err) {
        throw err;
      }
      request(server).get("/documents").end(cb);
    });
  }
});
