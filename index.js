'use strict';

var delims = require('delimiter-regex');
var isObject = require('isobject');
var isFalsey = require('falsey');
var getFile = require('get-view');
var utils = require('./utils');
var regexCache = {};

/**
 * Apply a layout from the `layouts` object to `file.contents`.
 * Layouts will be recursively applied until a layout is not
 * defined by the returned file.
 *
 * ```js
 * var applyLayouts = require('layouts');
 * var layouts = {};
 * layouts.default = new File({path: 'default', contents: new Buffer('foo\n{% body %}\nbar')}),
 * layouts.other = new File({path: 'other', contents: new Buffer('baz\n{% body %}\nqux')});
 * layouts.other.layout = 'default';
 *
 * var file = new File({path: 'whatever', contents: new Buffer('inner')});
 * file.layout = 'other';
 *
 * applyLayouts(file, layouts);
 * console.log(file.contents.toString());
 * // foo
 * // bar
 * // inner
 * // baz
 * // qux
 * ```
 * @param {Object} `file` File object. This can be a plain object or [vinyl][] file.
 * @param {Object} `layouts` Object of file objects to use as "layouts".
 * @param {Object} `options`
 * @return {Object} Returns the original file object with layout(s) applied.
 * @api public
 */

function layouts(file, stack, options, fn) {
  if (!isObject(file)) {
    throw new TypeError('expected file to be an object');
  }
  if (typeof file.path !== 'string') {
    throw new TypeError('expected file.path to be a string');
  }
  if (typeof options === 'function') {
    fn = options;
    options = null;
  }

  var opts = Object.assign({}, options);
  var name = getLayoutName(file, opts.defaultLayout);
  if (name === false) {
    return file;
  }

  if (typeof name === 'undefined') {
    throw new TypeError('expected layout name to be a string or falsey, not undefined');
  }

  file.layoutStack = file.layoutStack || [];
  opts.tagname = opts.tagname || 'body';
  var regex = createRegex(opts);
  var layout;
  var prev;

  // recursively resolve stack
  while (name && (prev !== name) && (layout = getFile(name, stack))) {
    if (file.layoutStack.indexOf(layout) !== -1) {
      name = null;
      break;
    }

    file.layoutStack.push(layout);
    prev = name;
    name = resolveLayout(file, layout, opts, regex, name);

    // if a function is passed, call it on the file
    if (typeof fn === 'function') {
      fn(file, layout);
    }
  }

  if (typeof name === 'string' && prev !== name) {
    throw new Error('could not find layout "' + name + '"');
  }

  file.contents = new Buffer(file.content);
  return file;
}

/**
 * Resolve the layout to use for the current file.
 */

function resolveLayout(file, layout, options, regex, name) {
  var val = toString(layout, options);

  if (!val.match(regex)) {
    var delims = utils.matchDelims(regex, options.tagname);
    throw new Error(`cannot find tag "${delims}" in "${name}"`);
  }

  // ensure that the indent variable is defined
  var str = toString(file, options);
  file.content = val.replace(regex, str);

  layout.content = toString(layout, options);
  if (!layout.contents) {
    layout.contents = new Buffer(layout.content);
  }

  return getLayoutName(layout, options.defaultLayout);
}

/**
 * Get the contents string from the file object
 */

function toString(file, options) {
  var str = (file.content || file.contents || '').toString();
  return options.trim ? str.trim() : str;
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

function getLayoutName(file, defaultLayout) {
  var name = file.layout;
  if (typeof name === 'undefined' || name === true || name === defaultLayout) {
    return defaultLayout;
  }
  name = String(name);
  if (name === 'false' || name === 'null' || name === 'nil' || name === '') {
    return false;
  }
  if (name && isFalsey(name)) {
    return false;
  }
  return name;
}

/**
 * Create the regex to use for matching
 */

function createRegex(options) {
  var opts = Object.assign({}, options);
  var layoutDelims = options.delims || options.layoutDelims;
  var key = options.tagname;
  if (layoutDelims) key += layoutDelims;
  var regex;
  if (regexCache.hasOwnProperty(key)) {
    return regexCache[key];
  }
  if (layoutDelims instanceof RegExp) {
    regexCache[key] = layoutDelims;
    return layoutDelims;
  }
  if (Array.isArray(layoutDelims)) {
    opts.close = layoutDelims[1];
    opts.open = layoutDelims[0];
  }
  if (typeof layoutDelims === 'string') {
    regex = new RegExp(layoutDelims);
    regexCache[key] = regex;
    return regex;
  }
  opts.flags = 'g';
  opts.close = opts.close || '%}';
  opts.open = opts.open || '{%';
  regex = delims(opts);
  regexCache[key] = regex;
  return regex;
}

/**
 * Expose utils
 */

layouts.getLayoutName = getLayoutName;
layouts.createRegex = createRegex;
module.exports = layouts;
