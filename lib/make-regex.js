'use strict';

var typeOf = require('kind-of');

module.exports = function(syntax) {
  var regex = syntax;
  var escaped = false;

  if (typeOf(syntax) === 'regexp') {
    regex = syntax;
  }

  if (typeOf(syntax) === 'string') {
    regex = new RegExp(syntax, 'g');
  }

  if (Array.isArray(syntax) && escaped === false) {
    escaped = true;
    var Delims = require('delims');
    var delims = new Delims(syntax, {escape: true});
    var re = delims.templates(syntax);
    regex = re.evaluate;
  }
  return regex;
};
