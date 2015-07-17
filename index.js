'use strict';

var isFalsey = require('falsey');
var Buffer = require('buffer').Buffer;
var delims = require('delimiter-regex');
var get = require('get-value');

/**
 * Expose `layouts`
 */

module.exports = renderLayouts;

/**
 * Cache compiled delimiter regex.
 *
 * If delimiters need to be generated, this ensures that
 * runtime compilation only happens once.
 */

var cache = {};

/**
 * Wrap one or more layouts around `string`.
 *
 * ```js
 * renderLayouts(string, layoutName, layoutStack, options, fn);
 * ```
 *
 * @param  {String} `string` The string to wrap with a layout.
 * @param  {String} `layoutName` The name (key) of the layout object to use.
 * @param  {Object} `layoutStack` Object of layout objects.
 * @param  {Object} `options` Optionally define a `defaultLayout` (string), pass custom delimiters (`layoutDelims`) to use as the placeholder for the content insertion point, or change the name of the placeholder tag with the `tag` option.
 * @param  {Function} `fn` Optionally pass a function to modify the context as each layout is applied.
 * @return {String} Returns the original string wrapped with one or more layouts.
 * @api public
 */

function renderLayouts(str, name, layoutStack, opts, fn) {
  if (isBuffer(str)) {
    str = str.toString();
  }

  if (typeof str !== 'string') {
    throw new TypeError('layouts expects a string.');
  }

  if (typeof opts === 'function') {
    fn = opts;
    opts = {};
  }

  opts = opts || {};
  var layout = {};
  var depth = 0;
  var prev;

  // `view` is the object we'll use to store the result
  var view = {options: {}, history: []};

  // recursively resolve layouts
  while (name && (prev !== name) && (layout = layoutStack[name])) {
    var delims = opts.layoutDelims;

    // `data` is passed to `wrapLayout` to resolve layouts
    // to the values on the data object.
    var data = {};
    data[opts.tag || 'body'] = str;

    // get info about the current layout
    var obj = {};
    obj.layout = layout;
    obj.layout.name = name;
    obj.before = str;
    obj.depth = depth++;

    // inject the string into the layout
    str = wrapLayout(layout.contents || layout.content, data, delims);
    obj.after = str;

    // if a (sync) callback is passed, allow it modify
    // the result in place
    if (typeof fn === 'function') {
      fn(obj, view, depth);
    }

    // push info about the layout onto `history`
    view.history.push(obj);
    prev = name;

    // should we recurse again?
    // (does the `layout` itself specify another layout?)
    name = assertLayout(layout.layout, opts.defaultLayout);
  }

  view.options = opts;
  view.result = str;
  return view;
}

/**
 * Assert whether or not a layout should be used based on
 * the given `value`.
 *
 *   - If a layout should be used, the name of the layout is returned.
 *   - If not, `null` is returned.
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
 * Resolve template strings to the values on the given
 * `data` object.
 */

function wrapLayout(content, data, syntax) {
  var re = makeDelimiterRegex(syntax);
  return toString(content).replace(re, function(_, tagName) {
    if (tagName.indexOf('.') !== -1) {
      return toString(get(data, tagName.trim()));
    }
    return data[tagName.trim()];
  });
}

/**
 * Make delimiter regex.
 *
 * @param  {Sring|Array|RegExp} `syntax`
 * @return {RegExp}
 */

function makeDelimiterRegex(syntax) {
  if (!syntax) return /\{% ([^{}]+?) %}/g;
  if (syntax instanceof RegExp) {
    return syntax;
  }
  var name = syntax + '';
  if (cache.hasOwnProperty(name)) {
    return cache[name];
  }
  if (typeof syntax === 'string') {
    return new RegExp(syntax, 'g');
  }
  if (Array.isArray(syntax)) {
    return (cache[syntax] = delims(syntax));
  }
}

/**
 * Cast `val` to a string.
 */

function toString(val) {
  return val == null ? '' : val.toString();
}

function isBuffer(val) {
  return typeof val === 'object'
    && val instanceof Buffer;
}
