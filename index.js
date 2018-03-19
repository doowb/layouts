'use strict';

const isFalsey = require('falsey');
const getView = require('get-view');
let memo = new Map();

/**
 * Apply a layout from the `layouts` collection to `file.contents`. Layouts will be
 * recursively applied until a layout is not defined by the returned file.
 *
 * ```js
 * const renderLayouts = require('layouts');
 * const layouts = {
 *   default: new File({ path: 'default', contents: new Buffer('foo\n{% body %}\nbar')}),
 *   sidebar: new File({
 *     path: 'sidebar.hbs',
 *     contents: new Buffer('baz\n{% body %}\nqux'),
 *     layout: default
 *   })
 * };
 *
 * const file = new File({path: 'whatever', contents: new Buffer('inner')});
 * file.layout = 'other';
 *
 * renderLayouts(file, layouts);
 * console.log(file.contents.toString());
 * // foo
 * // bar
 * // inner
 * // baz
 * // qux
 * ```
 * @param {Object} `file` File object. This can be a plain object or [vinyl][] file.
 * @param {Object} `layouts` Collection of layouts (file objects).
 * @param {Object} `options`
 * @return {Object} Returns the original file object with layout(s) applied.
 * @api public
 */

function layouts(file, layouts, options, transformFn) {
  if (!file || typeof file !== 'object') {
    throw new TypeError('expected file to be an object');
  }

  if (typeof options === 'function') {
    transformFn = options;
    options = null;
  }

  const opts = Object.assign({}, options);
  let name = getLayoutName(file, opts);
  if (!name) return file;

  define(file, 'layoutStack', file.layoutStack || []);
  opts.tagname = opts.tagname || 'body';
  const regex = createDelimiterRegex(opts);
  let layout;
  let n = 0;

  // recursively resolve layouts
  while ((layout = getLayout(layouts, name))) {
    if (inHistory(file, layout, opts)) {
      break;
    }

    // if a function is passed, call it on the file before resolving the next layout
    if (typeof transformFn === 'function') {
      transformFn(file, layout);
    }

    file.layoutStack.push(layout);
    name = renderLayout(file, layout, opts, regex, name);
    n++;
  }

  if (n === 0) {
    throw new Error(`layout ${name} was not found`);
  }

  return file;
}

/**
 * Apply the current layout to the file.
 */

// function renderLayout(file, layout, options, regex, name) {
//   const layoutString = toString(layout, options);

//   if (!regex.test(layoutString)) {
//     throw new Error(`cannot find tag "${regex.source}" in layout "${name}"`);
//   }

//   // ensure that the indent variable is defined
//   const fileString = toString(file, options);
//   const newString = layoutString.replace(regex, fileString);

//   file.contents = Buffer.from(newString);
//   return getLayoutName(layout, options);
// }
function renderLayout(file, layout, options, regex, name) {
  let layoutString = toString(layout, options);

  if (!layoutString) {
    throw new Error('expected layout contents to be a buffer');
  }
  // ensure that the indent variable is defined
  const fileString = toString(file, options);
  if (!fileString) {
    throw new Error('expected file contents to be a buffer');
  }

  // reset lastIndex, since regex is cached
  regex.lastIndex = 0;

  if (!regex.test(layoutString)) {
    throw new Error(`cannot find tag "${regex.source}" in layout "${name}"`);
  }

  if (options.whitespace === true) {
    regex = new RegExp('(?:^(\\s+))?' + regex.source, 'gm');

    let lines
    const str = layoutString.replace(regex, function(m, whitespace, body, index) {
      if (whitespace) {
        lines = lines || fileString.split('\n'); // only split once, JIT
        return lines.map(line => whitespace + line).join('\n');
      }
      return fileString;
    });

    file.contents = Buffer.from(str);
  } else {
    file.contents = Buffer.from(layoutString.replace(regex, fileString));
  }

  return getLayoutName(layout, options);
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

function getLayoutName(file, options) {
  const defaultLayout = options.defaultLayout;
  const prop = options.layoutProp || 'layout';
  const name = file[prop];
  if (typeof name === 'undefined' || name === true || name === defaultLayout) {
    return defaultLayout;
  }
  if (isFalsey(name)) {
    return false;
  }
  return name;
}

/**
 * Returns true if `name` is in the layout `history`
 */

function inHistory(file, layout, options) {
  if (options.disableHistory !== true) {
    return file.layoutStack.indexOf(layout) !== -1;
  }
  return false;
}

/**
 * Gets the layout to use from the given collection
 */

function getLayout(collection, name) {
  if (!name) return;
  for (const key of Object.keys(collection)) {
    const view = collection[key];
    if (name === key) {
      return view;
    }
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
  if (memo.has(key)) {
    const re = memo.get(key);
    re.lastIndex = 0;
    return re;
  }

  if (layoutDelims instanceof RegExp) {
    memo.set(key, layoutDelims);
    return layoutDelims;
  }

  if (Array.isArray(layoutDelims)) {
    layoutDelims = `${opts.layoutDelims[0]} (${tagname}) ${opts.layoutDelims[1]}`;
  }

  if (typeof layoutDelims !== 'string') {
    throw new TypeError('expected options.layoutDelims to be a string, array or regex');
  }

  const regex = new RegExp(layoutDelims, 'g');
  memo.set(key, regex);
  return regex;
}

/**
 * Gets the contents string from the file object.
 */

function toString(file, options) {
  const str = (file.content || file.contents).toString();
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

layouts.clearCache = () => (memo = new Map());
layouts.getLayoutName = getLayoutName;
layouts.createDelimiterRegex = createDelimiterRegex;
module.exports = layouts;
