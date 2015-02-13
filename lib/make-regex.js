'use strict';

var typeOf = require('kind-of');

module.exports = function(syntax) {
  var regex = syntax;

  if (typeOf(syntax) === 'regexp') {
    regex = syntax;
  }

  if (typeOf(syntax) === 'string') {
    regex = new RegExp(syntax, 'g');
  }

  if (Array.isArray(syntax)) {
    var delims = require('delimiter-regex');
    regex = delims(syntax);
  }
  return regex;
};
