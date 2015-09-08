'use strict';

var utils = require('./utils');

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
  if (utils.isBuffer(str)) {
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
    str = toString(str);

    // `data` is passed to `wrapLayout` to resolve layouts
    // to the values on the data object.
    var data = {};
    var tag = opts.tag || 'body';
    data[tag] = str;

    // get info about the current layout
    var obj = {};
    obj.layout = layout;
    obj.layout.name = name;
    obj.before = str;
    obj.depth = depth++;

    // get the delimiter regex
    var re = makeDelimiterRegex(delims);

    // ensure that content is a string
    var content = toString(layout.contents || layout.content);
    if (!re.test(content)) {
      throw new Error('cannot find layout tag "' + tag + '" in "' + name + '"');
    }

    // inject the string into the layout
    str = wrapLayout(content, data, re);
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
  if (value === false || (value && utils.isFalsey(value))) {
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

function wrapLayout(str, data, re) {
  return str.replace(re, function(_, tagName) {
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
    return (cache[syntax] = utils.delims(syntax));
  }
}

/**
 * Cast `val` to a string.
 */

function toString(val) {
  return val == null ? '' : val.toString();
}
