'use strict';

var utils = require('./utils');
var regexCache = {};

/**
 * Apply a layout from the `layouts` object to `file.contents`. Layouts will be
 * recursively applied until a layout is not defined by the returned file.
 *
 * ```js
 * var applyLayout = require('layouts');
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

module.exports = function applyLayouts(file, layouts, options) {
  if (!utils.isObject(file)) {
    throw new TypeError('expected file to be an object');
  }
  if (typeof file.path !== 'string') {
    throw new TypeError('expected file.path to be a string');
  }

  var opts = utils.extend({}, options);
  var name = getLayoutName(file, opts.defaultLayout);
  if (name === false) {
    return file;
  }

  if (typeof name === 'undefined') {
    throw new TypeError('expected layout name to be a string or falsey, not undefined');
  }

  file.layoutHistory = file.layoutHistory || [];
  opts.tagname = opts.tagname || 'body';
  var regex = createRegex(opts);
  var layout;
  var prev;

  // recursively resolve layouts
  while (name && (prev !== name) && (layout = utils.getFile(name, layouts))) {
    file.layoutHistory.push(name);
    prev = name;
    name = resolveLayout(file, layout, opts, regex, name);

    if (file.layoutHistory.indexOf(name) !== -1) {
      name = null;
      break;
    }
  }

  if (typeof name === 'string' && prev !== name) {
    throw new Error('could not find layout "' + name + '"');
  }

  file.contents = new Buffer(file.content);
  return file;
};

/**
 * Resolve the layout to use for the current file.
 */

function resolveLayout(file, layout, options, regex, name) {
  var val = toString(layout, options);

  if (!regex.test(val)) {
    var delims = utils.matchDelims(regex, options.tagname);
    throw new Error(`cannot find tag "${delims}" in "${name}"`);
  }

  if (!layout.contents) {
    layout.contents = new Buffer(layout.content);
  }

  var str = toString(file, options);
  file.content = val.replace(regex, str);
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
  if (typeof name === 'undefined' || name === true) {
    return defaultLayout;
  } else if (name === false || name === null || name === 'null' || name === '' || (name && utils.isFalsey(name))) {
    return false;
  } else {
    return name;
  }
}

/**
 * Create the regex to use for matching
 */

function createRegex(options) {
  var opts = utils.extend({}, options);
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
  regex = utils.delims(opts);
  regexCache[key] = regex;
  return regex;
}

/**
 * Expose utils
 */

module.exports.getLayoutName = getLayoutName;
module.exports.createRegex = createRegex;
