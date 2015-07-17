"use strict";

module.exports = function(str) {
  return str
    .replace(/[\\"']/g, "\\$&") // Add Slashes
    .replace(/\u0000/g, "\\0") // Add slashes to null
    .replace(/\</g, "\x3C"); // Escape <
};
