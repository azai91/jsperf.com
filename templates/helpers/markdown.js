"use strict";

var marked = require("marked");

module.exports = function(str) {
  return marked(str);
};
