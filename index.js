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
  const filename = file.relative || file.path;
  const regex = createDelimiterRegex(opts);
  let name = getLayoutName(file, opts);
  let skipped = false;
  let layout;
  let n = 0;

  if (!name) return file;

  if (!file[layouts.stack]) {
    define(file, layouts.stack, []);
  }

  // recursively resolve layouts
  while ((layout = getLayout(layoutCollection, name))) {
    if (inHistory(file, layout, opts)) {
      skipped = true;
      break;
    }

    // if a function is passed, call it on the file before resolving the next layout
    if (typeof transformFn === 'function') {
      transformFn(file, layout);
    }

    if (opts.disableHistory !== true) {
      file[layouts.stack].push(layout);
    }
    name = applyLayout(file, layout, opts, regex, name);
    n++;
  }

  if (n === 0) {
    let msg = `layout "${name}" is defined on "${filename}" but cannot be found.`;
    if (skipped) {
      msg = `layout "${name}" was not applied to "${filename}" because it was already applied by a previous call to 'layouts()'. Use options.disableHistory to disable this feature.`;
    }
    throw new Error(msg);
  }

  if (opts.keepStack !== true) {
    delete file[layouts.stack];
  }
  return file;
}

/**
 * Apply the current layout, and resolve the name of the next layout to apply.
 */

function applyLayout(file, layout, options, regex, name) {
  if (typeOf(layout.contents) !== 'buffer') {
    throw new Error('expected layout.contents to be a buffer');
  }

  let fn = layout[layouts.fn];
  if (options.compileLayout === false || typeof fn !== 'function') {
    fn = compileLayout(name, layout, regex, options);
  }

  file.contents = Buffer.from(fn(file, options));
  return getLayoutName(layout, options);
}

function compileLayout(name, layout, regex, options) {
  const layoutString = toString(layout, options);

  if (!regex.test(layoutString)) {
    throw new Error(`cannot find tag "${regex.source}" in layout "${name}"`);
  }

  const render = (file, options) => {
    const str = toString(file, options);

    let res;
    if (options.preserveWhitespace === true) {
      const src = regex.source;
      const re = new RegExp(`(?:^(\\s+))?${src}`, 'gm');
      let lines;

      res = layoutString.replace(re, (m, whitespace) => {
        if (whitespace) {
          lines = lines || str.split('\n'); // only split once, JIT
          return lines.map(line => whitespace + line).join('\n');
        }
        return str;
      });
      regex.lastIndex = 0;
      return res;
    }

    res = layoutString.replace(regex, str);
    regex.lastIndex = 0;
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
  return options.disableHistory !== true && file[layouts.stack].includes(layout);
}

/**
 * Gets the layout to use from the given collection
 */

function getLayout(collection, name) {
  if (!name) return;
  if (collection instanceof Map) {
    if (collection.has(name)) {
      return collection.get(name);
    }
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

  if (collection[name]) {
    return collection[name];
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
  let tagname = options.tagname;
  let layoutDelims = options.delims || options.layoutDelims || `{% (${tagname}) %}`;
  let key = tagname;
  let regex;

  if (layoutDelims instanceof RegExp) {
    layouts.memo.set(key, layoutDelims);
    layoutDelims.lastIndex = 0;
    return layoutDelims;
  }

  if (layoutDelims) key += layoutDelims.toString();
  regex = layouts.memo.get(key);

  if (regex) {
    regex.lastIndex = 0;
    return regex;
  }

  if (Array.isArray(layoutDelims)) {
    layoutDelims = `${options.layoutDelims[0]} (${tagname}) ${options.layoutDelims[1]}`;
  }

  if (typeof layoutDelims !== 'string') {
    throw new TypeError('expected options.layoutDelims to be a string, array or regex');
  }

  regex = new RegExp(layoutDelims, 'g');
  layouts.memo.set(key, regex);
  return regex;
}

/**
 * Gets the contents string from the file object.
 */

function toString(file, options) {
  let str = file[options.contentProp] || file.content || file.contents;
  if (str && typeof str !== 'string') str = String(str);
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

function isBuffer(val) {
  return val && typeof val === 'object' && val.constructor
    && typeof val.constructor.isBuffer === 'function'
    && val.constructor.isBuffer(val);
}

/**
 * Expose utils
 */

layouts.fn = Symbol('layoutsfn');
layouts.stack = Symbol('layoutsstack');
layouts.memo = new Map();
layouts.getLayoutName = getLayoutName;
layouts.createDelimiterRegex = createDelimiterRegex;
layouts.clearCache = () => (layouts.memo = new Map());
module.exports = layouts;
