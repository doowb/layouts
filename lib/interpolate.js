'use strict';

var makeRe = require('./make-regex');
var re = /\{\%([^\}]+)\%\}/g;

module.exports = function(str, context, syntax) {
  if (syntax) syntax = makeRe(syntax);

  return toString(str).replace(syntax || re, function(match, prop) {
    if (/\./.test(prop)) {
      var get = require('get-value');
      return toString(get(context, prop.trim()));
    }
    return context[prop.trim()];
  });
};

function toString(val){
  return val == null ? '' : val.toString();
}