"use strict";

module.exports = function(str) {
  return str.replace(/[\r\n]{1,2}/g, "\n\n    ");
};
