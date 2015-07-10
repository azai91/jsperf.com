"use strict";

var hljs = require("highlight.js");

module.exports = function(code, lang, options) {
  if (arguments.length === 2) {
    options = lang;
    lang = "javascript";
  }
  return hljs.highlight(lang || "javascript", code).value;
};
