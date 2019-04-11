'use strict';

const typeOf = require('kind-of');
const getView = require('get-view');

/**
 * Apply a layout from the `layouts` collection to `file.contents`. Layouts will be
 * recursively applied until a layout is not defined by the returned file.
 *
 * @param {Object} `file` File object. This can be a plain object or vinyl file.
 * @param {Object} `layoutCollection` Collection of file objects to use as layouts.
 * @param {Object} `options`
 * @return {Object} Returns the original file object with layout(s) applied.
 */

function layouts(file, layoutCollection, options, transformFn) {
  if (typeOf(file) !== 'object') {
    throw new TypeError('expected file to be an object');
  }

  if (typeOf(layoutCollection) !== 'object' && !(layoutCollection instanceof Map)) {
    throw new TypeError('expected layouts collection to be an object');
  }

  if (typeOf(file.contents) !== 'buffer') {
    throw new TypeError('expected file.contents to be a buffer');
  }

  if (typeof options === 'function') {
    transformFn = options;
    options = null;
  }

  const opts = Object.assign({ tagname: 'body' }, options, file.options);
  const regex = createDelimiterRegex(opts);
  let name = getLayoutName(file, opts);
  let layout;
  let n = 0;

  if (!name) return file;

  define(file, 'layoutStack', file.layoutStack || []);

  // recursively resolve layouts
  while ((layout = getLayout(layoutCollection, name))) {
    if (inHistory(file, layout, opts)) break;

    // if a function is passed, call it on the file before resolving the next layout
    if (typeof transformFn === 'function') {
      transformFn(file, layout);
    }

    file.layoutStack.push(layout);
    name = resolveLayout(file, layout, opts, regex, name);
    n++;
  }

  if (n === 0) {
    let filename = file.relative || file.path;
    throw new Error(`layout "${name}" is defined on "${filename}" but cannot be found`);
  }

  return file;
}

/**
 * Apply the current layout, and resolve the name of the next layout to apply.
 */

function resolveLayout(file, layout, options, regex, name) {
  if (typeOf(layout.contents) !== 'buffer') {
    throw new Error('expected layout.contents to be a buffer');
  }

  // reset lastIndex, since regex is cached
  regex.lastIndex = 0;

  const layoutString = toString(layout, options);
  if (!regex.test(layoutString)) {
    throw new Error(`cannot find tag "${regex.source}" in layout "${name}"`);
  }

  const fileString = toString(file, options);
  let str;

  if (options.preserveWhitespace === true) {
    const re = new RegExp('(?:^(\\s+))?' + regex.source, 'gm');
    let lines;

    str = layoutString.replace(re, function(m, whitespace) {
      if (whitespace) {
        lines = lines || fileString.split('\n'); // only split once, JIT
        return lines.map(line => whitespace + line).join('\n');
      }
      return fileString;
    });

  } else {
    str = Buffer.from(layoutString.replace(regex, () => fileString));
  }

  file.contents = Buffer.from(str);
  return getLayoutName(layout, options);
}

/**
 * Get the name of the layout to use.
 * @param  {Object} `file`
 * @param  {Object} `options`
 * @return {String|Null} Returns the name of the layout to use or `false`
 */

function getLayoutName(file, options) {
  const defaultLayout = options.defaultLayout;
  const prop = options.layoutProp || 'layout';
  const name = file[prop];
  if (typeof name === 'undefined' || name === true || name === defaultLayout) {
    return defaultLayout;
  }
  if (!name || ['false', 'null', 'nil', 'none', 'undefined'].includes(name.toLowerCase())) {
    return false;
  }
  return name;
}

/**
 * Returns true if `name` is in the layout `history`
 */

function inHistory(file, layout, options) {
  return !options.disableHistory && file.layoutStack.indexOf(layout) !== -1;
}

/**
 * Gets the layout to use from the given collection
 */

function getLayout(collection, name) {
  if (!name) return;
  if (collection instanceof Map) {
    for (const [key, view] of collection) {
      if (name === key) {
        return view;
      }
      if (!view.path) continue;
      if (!view.hasPath) {
        return getView(collection, name);
      }
      if (view.hasPath(name)) {
        return view;
      }
    }
    return;
  }

  for (const key of Object.keys(collection)) {
    const view = collection[key];
    if (name === key) {
      return view;
    }
    if (!view.path) continue;
    if (!view.hasPath) {
      return getView(collection, name);
    }
    if (view.hasPath(name)) {
      return view;
    }
  }
}

/**
 * Creates a regular expression to use for matching delimiters, based on
 * the given options.
 */

function createDelimiterRegex(options) {
  const opts = Object.assign({}, options);
  let tagname = options.tagname;
  let layoutDelims = options.delims || options.layoutDelims || `{% (${tagname}) %}`;
  let key = tagname;

  if (layoutDelims) key += layoutDelims.toString();
  if (layouts.memo.has(key)) {
    return layouts.memo.get(key);
  }

  if (layoutDelims instanceof RegExp) {
    layouts.memo.set(key, layoutDelims);
    return layoutDelims;
  }

  if (Array.isArray(layoutDelims)) {
    layoutDelims = `${opts.layoutDelims[0]} (${tagname}) ${opts.layoutDelims[1]}`;
  }

  if (typeof layoutDelims !== 'string') {
    throw new TypeError('expected options.layoutDelims to be a string, array or regex');
  }

  const regex = new RegExp(layoutDelims, 'g');
  layouts.memo.set(key, regex);
  return regex;
}

/**
 * Gets the contents string from the file object.
 */

function toString(file, options) {
  let contents = file[options.contentProp] || file.content || file.contents;
  const str = contents.toString();
  return options.trim ? str.trim() : str;
}

/**
 * Add a non-enumerable property to `obj`
 */

function define(obj, key, val) {
  Reflect.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writeable: true,
    value: val
  });
}

/**
 * Expose utils
 */

layouts.memo = new Map();
layouts.clearCache = () => (layouts.memo = new Map());
layouts.getLayoutName = getLayoutName;
layouts.createDelimiterRegex = createDelimiterRegex;
module.exports = layouts;
