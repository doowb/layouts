'use strict';

var isFalsey = require('falsey');
var delims = require('delimiter-regex');
var get = require('get-value');

/**
 * Expose `layouts`
 */

module.exports = layouts;

/**
 * Wrap a string with a layout, or multiple layouts.
 *
 * @name layouts
 * @param {String} `str` The content string to be wrapped with a layout.
 * @param {String} `key` The object key of the starting layout.
 * @param {Object} `templates` Object of layouts.
 * @param {Object} `options`
 *     @option {Object} [options] `layoutDelims` Custom delimiters to use.
 *     @option {Object} [options] `defaultLayout` The name (key) of the default layout to use.
 * @return {String} String wrapped with a layout or layouts.
 * @api public
 */

function layouts(str, key, templates, opts, fn) {
  if (typeof str !== 'string') {
    throw new TypeError('layouts expects a string');
  }

  opts = opts || {};
  var template = {};
  var stack = [];
  var prev = null;

  while (key && (prev !== key) && (template = templates[key])) {
    stack.unshift(key);
    var delims = opts.layoutDelims;
    var context = {};
    context[opts.tag || 'body'] = str;
    str = interpolate(template.content, context, delims);
    prev = key;
    key = assertLayout(template.layout, opts.defaultLayout);
  }
  return str;
}

/**
 * Assert whether or not a layout should be used based on
 * the given `value`. If a layout should be used, the name of the
 * layout is returned, if not `null` is returned.
 *
 * @param  {*} `value`
 * @return {String|Null} Returns `true` or `null`.
 * @api private
 */

function assertLayout(value, defaultLayout) {
  if (value === false || (value && isFalsey(value))) {
    return null;
  } else if (!value || value === true) {
    return defaultLayout || null;
  } else {
    return value;
  }
}

/**
 * Cache compiled regexps to prevent runtime
 * compilation for the same delimiter strings
 * multiple times (this trick can be used for
 * any compiled regex)
 */

var cache = {};

/**
 * Resolve template strings to the values on the given
 * `context` object.
 */

function interpolate(content, context, syntax) {
  var re = cache[syntax] || (cache[syntax] = makeDelimiterRegex(syntax));
  return toString(content).replace(re, function(_, $1) {
    if ($1.indexOf('.') !== -1) {
      return toString(get(context, $1.trim()));
    }
    return context[$1.trim()];
  });
}

/**
 * Make delimiter regex.
 *
 * @param  {Sring|Array|RegExp} `syntax`
 * @return {RegExp}
 */

function makeDelimiterRegex(syntax) {
  if (typeof syntax === 'undefined') {
    return /\{% ([^{}]+?) %}/g;
  }
  if (syntax instanceof RegExp) {
    return syntax;
  }
  if (typeof syntax === 'string') {
    return new RegExp(syntax, 'g');
  }
  if (Array.isArray(syntax)) {
    return delims(syntax);
  }
}

/**
 * Cast `val` to a string.
 */

function toString(val){
  return val == null ? '' : val.toString();
}
