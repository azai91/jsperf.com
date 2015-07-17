"use strict";

var db = require("../lib/db");

var table = "comments";

module.exports = {
  getAll: function(fields, where, order, cb) {
    var conn = db.createConnection();

    conn.query("SELECT ? FROM ?? WHERE ? ORDER BY ?", [fields, table, where, order], cb);

    conn.end();
  }
};
