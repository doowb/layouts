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
    // only require if called
    var Delims = require('delims');
    var delims = new Delims();
    var re = delims.templates(syntax);
    regex = re.evaluate;
  }

  return regex;
};