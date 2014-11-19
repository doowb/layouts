'use strict';

var makeRe = require('./make-regex');
var re = /\{% ([^\}]+) %\}/g;

module.exports = function(content, obj, syntax) {
  if (syntax) syntax = makeRe(syntax);

  return toString(content).replace(syntax || re, function(match, prop) {
    if (/\./.test(prop)) {
      var get = require('get-value');
      return toString(get(obj, prop.trim()));
    }
    return obj[prop.trim()];
  });
};

function toString(val){
  return val == null ? '' : val.toString();
}
