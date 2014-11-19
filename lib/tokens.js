'use strict';

var re = require('regexp-special-chars');
var _ = require('lodash');

/**
 * Default token
 */

var token = '{% body %}';

/**
 * Replace tokens in the given layout `str` with
 * the specified `content`.
 *
 * @param {String} `str` Layout string
 * @param {String} `content` Content to inject
 * @param {String} `options`
 * @return {String}
 * @api private
 */

module.exports = function(str, content, options) {
  if (options && (options.tag || options.delims)) {
    token = makeToken(options);
  }
  return replace(str, token, content);
};

/**
 * Replacement function.
 *
 * @param {String} `str`
 * @param {String} `token`
 * @param {String} `replacement`
 * @return {String}
 * @api private
 */

function replace(str, token, replacement) {
  var i = str.indexOf(token);
  if (i > -1) {
    str = str.replace(makeRe(token), replacement);
    i = i + replacement.length;
    var res = str.substr(i);
    if (res.indexOf(token) > -1) {
      str = str.substr(0, i) + replace(res, token, replacement);
    }
  }
  return str;
}

function makeRe(delims) {
  delims = delims
    .replace(re, '\\$&')
    .replace(/(\s+)/g, '\\s*');
  return new RegExp(delims);
}

function makeToken(options) {
  options = options || {};
  var a = '{%';
  var b = '%}';

  if (Array.isArray(options.delims)) {
    a = options.delims[0].trim();
    b = options.delims[1].trim();
  }

  return a
    + ' '
    + (options.tag || 'body').trim()
    + ' '
    + b;
}
