"use strict";

module.exports = function(v1, operator, v2) {
  console.log(arguments);
  var options = arguments[arguments.length - 1];
  var boo;
  switch (operator) {
      case "==": boo = v1 === v2; break;
      case "!=": boo = v1 !== v2; break;
      case "<": boo = v1 < v2; break;
      case "<=": boo = v1 <= v2; break;
      case ">": boo = v1 > v2; break;
      case ">=": boo = v1 >= v2; break;
      case "&&": boo = v1 && v2; break;
      case "||": boo = v1 || v2; break;
      default: return options.inverse(this);
  }
  return boo ? options.fn(this) : options.inverse(this);
};
