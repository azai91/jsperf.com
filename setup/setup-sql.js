"use strict";

var mysql = require("mysql");
var fs = require("fs");
var path = require("path");
var async = require("async");

module.exports = function(result) {
  console.log(result);
  var conn = mysql.createConnection({
    host: result.db.host,
    port: result.db.port,
    user: result.db.user,
    password: result.db.pass
  });

  async.series([
    function(next) {
      conn.connect(function(e) {
        if (e) {
          console.error("failed to connect to database");
          return next(e);
        }
        next();
      });
    }, function(next) {
      conn.query("CREATE DATABASE IF NOT EXISTS " + result.db.name, function(e) {
        if (e) {
          console.log("Failed to find or Create Database" + result.db.name);
          return next(e);
        }
        console.log("Found or Created Datavase " + result.db.name);
        next();
      });
    }, function(next) {
      // Important to note, this requires Admin access
      var grantQuery = "GRANT ALL ON " + result.db.name + ".* TO " + conn.escape(result.db.user) + "@" + conn.escape(result.db.host);
      if (result.db.pass.length > 0) {
        grantQuery += " IDENTIFIED BY " + conn.escape(result.db.pass);
      }
      conn.query(grantQuery, function(err) {
        if (err) {
          console.log("failed to grant priledges to user");
          return next(err);
        }
        console.log("Granted permissions to your user");
        next();
      });
    }, function(next) {
      conn.query("FLUSH PRIVILEGES", function(err) {
        if (err) {
          console.log("failed to flush Privledges");
          return next(err);
        }
        console.log("flushed Privledges");
        next();
      });
    }, function(next) {
      conn.query("USE " + result.db.name, function(err) {
        if (err) {
          console.log("failed to use database " + result.db.name);
          return next(err);
        }
        console.log("Prepared to create tables");
        next();
      });
    }, function(next) {
      async.each(["comments", "pages", "tests"], function(table, next_) {
        var fileName = "create_" + table + ".sql";
        conn.query(
          fs.readFileSync(
            path.join(__dirname, "sql", fileName),
            { encoding: "utf8" }
          ),
          function(err) {
            if (err) {
              console.log("failed to create table " + table);
              return next_(err);
            }
            console.log("Created " + table + " table");
            next_();
          }
        );
      }, next);
    }
  ], function(e) {
    if (e) {
      throw e;
    }
    conn.end();
  });
};
