"use strict";

var Lab = require("lab");
var Code = require("code");
var proxyquire = require("proxyquire");
var sinon = require("sinon");

var pagesRepoStub = {};

var testsRepoStub = {};

var bsRepoStub = {};

var pages = proxyquire("../../../server/services/pages", {
  "../repositories/pages": pagesRepoStub,
  "../repositories/tests": testsRepoStub,
  "../repositories/browserscope": bsRepoStub
});

var lab = exports.lab = Lab.script();

lab.experiment("Pages Service", function() {
  var s;

  lab.beforeEach(function(done) {
    s = sinon.sandbox.create();

    done();
  });

  lab.afterEach(function(done) {
    s.restore();

    done();
  });

  lab.experiment("checkIfSlugAvailable", function() {
    var testSlug;
    var tableStub;
    var serverMock;

    lab.beforeEach(function(done) {
      testSlug = "test-slug";

      tableStub = s.stub().returns([
        {
          table: [
            {
              path: "/"
            }
          ]
        }
      ]);

      serverMock = {
        table: tableStub
      };

      pagesRepoStub.get = s.stub();

      done();
    });

    lab.test("returns false if slug is reserved", function(done) {
      testSlug = "reserved";

      tableStub = s.stub().returns([
        {
          table: [
            {
              path: "/" + testSlug
            }
          ]
        }
      ]);

      serverMock = {
        table: tableStub
      };

      pages.checkIfSlugAvailable(serverMock, testSlug, function(err, isAvail) {

        Code.expect(err).to.be.null();
        Code.expect(isAvail).to.be.false();
        Code.expect(pagesRepoStub.get.called).to.be.false();

        done();
      });
    });

    lab.test("returns error if getting page fails", function(done) {
      var testErrMsg = "testing";
      var testErr = new Error(testErrMsg);

      pagesRepoStub.get.callsArgWith(2, testErr);

      pages.checkIfSlugAvailable(serverMock, testSlug, function(err) {

        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });

    });

    lab.test("returns false if page with slug exists", function(done) {
      pagesRepoStub.get.callsArgWith(2, null, {});

      pages.checkIfSlugAvailable(serverMock, testSlug, function(err, isAvail) {

        Code.expect(err).to.be.null();
        Code.expect(isAvail).to.be.false();

        done();
      });
    });

    lab.test("returns true if no app route or page exists for given slug", function(done) {
      pagesRepoStub.get.callsArgWith(2, null, undefined);

      pages.checkIfSlugAvailable(serverMock, testSlug, function(err, isAvail) {

        Code.expect(err).to.be.null();
        Code.expect(isAvail).to.be.true();

        done();
      });

    });

  });

  lab.experiment("create", function() {
    var payload;

    lab.beforeEach(function(done) {
      payload = {};

      bsRepoStub.addTest = s.stub();

      pagesRepoStub.create = s.stub();

      testsRepoStub.bulkCreate = s.stub();

      done();
    });

    lab.test("returns error if browserscope fails to add test", function(done) {
      var testErrMsg = "testing";
      var testErr = new Error(testErrMsg);

      bsRepoStub.addTest.callsArgWith(3, testErr);

      pages.create(payload, function(err) {

        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);
        Code.expect(pagesRepoStub.create.called).to.be.false();

        done();
      });
    });

    lab.test("returns error if page fails to create", function(done) {
      var testErrMsg = "testing";
      var testErr = new Error(testErrMsg);

      bsRepoStub.addTest.callsArgWith(3, null);

      pagesRepoStub.create.callsArgWith(1, testErr);

      pages.create(payload, function(err) {

        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);
        Code.expect(testsRepoStub.bulkCreate.called).to.be.false();

        done();
      });
    });

    lab.test("returns error if tests fail to create", function(done) {
      var testErrMsg = "testing";
      var testErr = new Error(testErrMsg);

      bsRepoStub.addTest.callsArgWith(3, null);

      pagesRepoStub.create.callsArgWith(1, null);

      testsRepoStub.bulkCreate.callsArgWith(2, testErr);

      pages.create(payload, function(err) {

        Code.expect(err).to.be.instanceof(Error);
        Code.expect(err.message).to.equal(testErrMsg);

        done();
      });
    });

    lab.test("adds browserscope test, page, and tests", function(done) {

      bsRepoStub.addTest.callsArgWith(3, null);

      pagesRepoStub.create.callsArgWith(1, null);

      testsRepoStub.bulkCreate.callsArgWith(2, null);

      pages.create(payload, function(err) {

        Code.expect(err).to.be.null();

        done();
      });
    });
  });

  lab.experiment("getPopular", function() {
    lab.beforeEach(function(done) {
      pagesRepoStub.getPopularRecent = s.stub();
      pagesRepoStub.getPopularAllTime = s.stub();

      done();
    });

    lab.test("returns error if getting recent fails", function(done) {
      pagesRepoStub.getPopularRecent.callsArgWith(0, new Error());

      pages.getPopular(function(err) {
        Code.expect(err).to.be.instanceof(Error);
        Code.expect(pagesRepoStub.getPopularAllTime.called).to.be.false();

        done();
      });
    });

    lab.test("returns error if getting all-time fails", function(done) {
      pagesRepoStub.getPopularRecent.callsArgWith(0, null, []);
      pagesRepoStub.getPopularAllTime.callsArgWith(0, new Error());

      pages.getPopular(function(err) {
        Code.expect(err).to.be.instanceof(Error);

        done();
      });
    });

    lab.test("returns object of recent and all-time pages", function(done) {
      pagesRepoStub.getPopularRecent.callsArgWith(0, null, []);
      pagesRepoStub.getPopularAllTime.callsArgWith(0, null, []);

      pages.getPopular(function(err, results) {
        Code.expect(err).to.be.null();
        Code.expect(results).to.be.object();
        Code.expect(results.recent).to.be.array();
        Code.expect(results.allTime).to.be.array();

        done();
      });
    });
  });

  lab.experiment("find", function() {
    lab.beforeEach(function(done) {
      pagesRepoStub.find = s.stub();

      done();
    });

    lab.test("calls through to repo method of same name", function(done) {
      var testErr = null;
      var testRes = [];
      pagesRepoStub.find.callsArgWith(1, testErr, testRes);

      pages.find("query", function(err, results) {
        Code.expect(err).to.equal(testErr);
        Code.expect(results).to.equal(testRes);

        done();
      });
    });
  });
});
