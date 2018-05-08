'use strict';

const assert = require('assert');
const getFile = require('./get-file');

/**
 * Apply a layout from the `layouts` collection to `file.contents`. Layouts will be
 * recursively applied until a layout is not defined by the returned file.
 *
 * @param {Object} `file` File object. This can be a plain object or vinyl file.
 * @param {Object} `files` Collection of file objects to use as layouts.
 * @param {Object} `options`
 * @return {Object} Returns the original file object with layout(s) applied.
 */

function layouts(file, files, options = {}) {
  assert(isObject(file), 'expected file to be an object');
  assert(isObject(files), 'expected layouts collection to be an object');
  assert(isBuffer(file.contents), 'expected file.contents to be a buffer');

  // if (!isObject(file)) {
  //   throw new TypeError('expected file to be an object');
  // }

  // if (!isObject(files) && !isMap(files)) {
  //   throw new TypeError('expected layouts collection to be an object');
  // }

  // if (!isBuffer(file.contents)) {
  //   throw new TypeError('expected file.contents to be a buffer');
  // }
  const { transform, layoutRegex } = options;
  const filename = file.key || file.relative || file.path;
  const regex = layoutRegex || /{% body %}/g;
  let name = getLayoutName(file, options);
  if (!name) return file;

  let layout = getFile(files, name);
  assertLayout(name, layout, { file, name: filename });

  let str = contents(file, options);
  let skipped = false;
  let n = 0;

  // recursively resolve layouts
  while (name && !history.includes(layout)) {
    if (typeof transform === 'function') {
      transform(file, layout);
    }

    // if (options.disableHistory !== true) {
    //   file[layouts.history].push(layout);
    // }

    regex.lastIndex = 0;
    str = applyLayout(name, str, layout, regex, options);
    name = getLayoutName(layout, options);

    n++;
  }

  if (n === 0) {
    let msg = `layout "${name}" is defined on "${filename}" but cannot be found.`;
    if (skipped) {
      msg = `layout "${name}" was not applied to "${filename}", `;
      msg += 'since it seems this layout has already been applied to the same file '
      msg += 'at some point. Use options.disableHistory to disable this feature.';
    }
    throw new Error(msg);
  }

  if (options.keepStack !== true) {
    delete file[layouts.history];
  }
  return file;
}

function assertLayout(name, layout, prev) {
  if (!layout) {
    const filename = prev.file.relative || prev.file.path || prev.name;
    const val = filename ? `"${filename}"` : 'the given file';
    const msg = `layout "${name}" is defined on ${val} but cannot be found.`;
    const err = new Error(msg);
    err.layout = prev;
    throw err;
  }
}

/**
 * Apply the current layout, and resolve the name of the next layout to apply.
 */

function applyLayout(name, str, layout, regex, options) {
  if (!isBuffer(layout.contents)) {
    throw new Error('expected layout.contents to be a buffer');
  }

  let fn = layout[layouts.fn];
  if (options.compileLayout === false || typeof fn !== 'function') {
    fn = compileLayout(name, layout, regex, options);
  }

  return fn(str, options);
}

function compileLayout(name, layout, regex, options) {
  const layoutString = contents(layout, options);

  if (!regex.test(layoutString)) {
    throw new Error(`cannot find tag "${regex.source}" in layout "${name}"`);
  }

  const render = (str, options) => {
    let res;
    if (options.preserveWhitespace === true) {
      const src = regex.source;
      const re = new RegExp(`(?:^(\\s+))?${src}`, 'gm');
      let lines;

      res = layoutString.replace(re, (m, whitespace) => {
        if (whitespace) {
          lines = lines || str.split(/\r?\n/); // only split once, on-demand
          return lines.map(line => whitespace + line).join('\n');
        }
        return str;
      });
      return res;
    }
    res = layoutString.replace(regex, str);
    return res;
  };

  layout[layouts.fn] = render;
  return render;
}

/**
 * Get the name of the layout to use.
 * @param  {Object} `file`
 * @param  {Object} `options`
 * @return {String|Null} Returns the name of the layout to use or `false`
 */

function getLayoutName(file, options) {
  const { defaultLayout, layoutKey } = options;
  const key = layoutKey || 'layout';
  const name = file[key];
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
  return options.disableHistory !== true && file[layouts.history].includes(layout);
}

/**
 * Gets the contents string from the file object.
 */

function contents(file, options) {
  const str = (file.contents || '').toString();
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

function isMap(val) {
  return val instanceof Map;
}

function isObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function isBuffer(val) {
  return val && typeof val === 'object' && val.constructor
    && typeof val.constructor.isBuffer === 'function'
    && val.constructor.isBuffer(val);
}

/**
 * Expose utils
 */

layouts.fn = Symbol('layoutsfn');
layouts.history = Symbol('layoutsstack');
layouts.memo = new Map();
layouts.getLayoutName = getLayoutName;
layouts.clearCache = () => (layouts.memo = new Map());
// module.exports = layouts;

module.exports = require('./bench/simple');
