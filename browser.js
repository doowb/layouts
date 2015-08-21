(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.index = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var isFalsey = require('falsey');
var isBuffer = require('is-buffer');
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

},{"delimiter-regex":2,"falsey":4,"get-value":5,"is-buffer":8}],2:[function(require,module,exports){
'use strict';

var extend = require('extend-shallow');

module.exports = function delimiters(open, close, options) {
  if (open instanceof RegExp) {
    return open;
  }

  if (typeof close !== 'string') {
    options = close;
    close = null;
  }

  if (typeof open === 'object' && !Array.isArray(open)) {
    options = open;
    open = null;
    close = null;
  }

  if (Array.isArray(open)) {
    var syntax = open.slice();
    open = syntax[0];
    close = syntax[1];
  }

  var opts = extend({flags: ''}, options);
  var body = '([\\s\\S]+?)';

  open = open ? open : '\\${';
  close = close ? close : '}';

  return new RegExp(open + body + close, opts.flags);
};

},{"extend-shallow":3}],3:[function(require,module,exports){
'use strict';

var typeOf = require('kind-of');

/**
 * Expose `extend`
 */

module.exports = extend;

/**
 * Extend `o` with properties of other `objects`.
 *
 * @param  {Object} `o` The target object. Pass an empty object to shallow clone.
 * @param  {Object} `objects`
 * @return {Object}
 */

function extend(o) {
  if (typeOf(o) !== 'object') { return {}; }
  var args = arguments;
  var len = args.length - 1;

  for (var i = 0; i < len; i++) {
    var obj = args[i + 1];

    if (typeOf(obj) === 'object' && typeOf(obj) !== 'regexp') {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          o[key] = obj[key];
        }
      }
    }
  }
  return o;
};

},{"kind-of":9}],4:[function(require,module,exports){
/*!
 * falsey <https://github.com/jonschlinkert/falsey>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var typeOf = require('kind-of');

module.exports = function falsey(val, arr) {
  var defaults = ['none', 'nil'];
  if (val === 'false' || val === false) {
    return true;
  }
  if (Array.isArray(val) || typeOf(val) === 'arguments') {
    return !val.length;
  }
  if (typeOf(val) === 'object') {
    return !Object.keys(val).length;
  }
  if (val === '0' || val === 0) {
    return true;
  }
  return !val || (arr || defaults).indexOf(val) !== -1;
};


},{"kind-of":9}],5:[function(require,module,exports){
/*!
 * get-value <https://github.com/jonschlinkert/get-value>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var noncharacters = require('noncharacters');
var isObject = require('isobject');

module.exports = function getValue(obj, str, fn) {
  if (!isObject(obj)) return {};
  if (typeof str !== 'string') return obj;

  var path;

  if (fn && typeof fn === 'function') {
    path = fn(str);
  } else if (fn === true) {
    path = escapePath(str);
  } else {
    path = str.split('.');
  }

  var len = path.length, i = 0;
  var last = null;

  while(len--) {
    last = obj[path[i++]];
    if (!last) { return last; }

    if (isObject(obj)) {
      obj = last;
    }
  }
  return last;
};


function escape(str) {
  return str.split('\\.').join(noncharacters[0]);
}

function unescape(str) {
  return str.split(noncharacters[0]).join('.');
}

function escapePath(str) {
  return escape(str).split('.').map(function (seg) {
    return unescape(seg);
  });
}

},{"isobject":6,"noncharacters":7}],6:[function(require,module,exports){
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function isObject(val) {
  return val != null && typeof val === 'object'
    && !Array.isArray(val);
};

},{}],7:[function(require,module,exports){
/*!
 * noncharacters <https://github.com/jonschlinkert/noncharacters>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = [
  '\uFFFF',
  '\uFFFE',

  '\uFDD1',
  '\uFDD2',
  '\uFDD3',
  '\uFDD4',
  '\uFDD5',
  '\uFDD6',
  '\uFDD7',
  '\uFDD8',
  '\uFDD9',
  '\uFDDA',
  '\uFDDB',
  '\uFDDC',
  '\uFDDD',
  '\uFDDE',
  '\uFDDF',
  '\uFDE0',
  '\uFDE1',
  '\uFDE2',
  '\uFDE3',
  '\uFDE4',
  '\uFDE5',
  '\uFDE6',
  '\uFDE7',
  '\uFDE8',
  '\uFDE9',
  '\uFDEA',
  '\uFDEB',
  '\uFDEC',
  '\uFDED',
  '\uFDEE',
  '\uFDEF'
];

},{}],8:[function(require,module,exports){
/**
 * Determine if an object is Buffer
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install is-buffer`
 */

module.exports = function (obj) {
  return !!(
    obj != null &&
    obj.constructor &&
    typeof obj.constructor.isBuffer === 'function' &&
    obj.constructor.isBuffer(obj)
  )
}

},{}],9:[function(require,module,exports){
var toString = Object.prototype.toString;

/**
 * Get the native `typeof` a value.
 *
 * @param  {*} `val`
 * @return {*} Native javascript type
 */

module.exports = function kindOf(val) {
  if (val === undefined) {
    return 'undefined';
  }
  if (val === null) {
    return 'null';
  }
  if (val === true || val === false || val instanceof Boolean) {
    return 'boolean';
  }
  if (typeof val !== 'object') {
    return typeof val;
  }
  if (Array.isArray(val)) {
    return 'array';
  }

  var type = toString.call(val);

  if (val instanceof RegExp || type === '[object RegExp]') {
    return 'regexp';
  }
  if (val instanceof Date || type === '[object Date]') {
    return 'date';
  }
  if (type === '[object Function]') {
    return 'function';
  }
  if (type === '[object Arguments]') {
    return 'arguments';
  }
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(val)) {
    return 'buffer';
  }
  return type.slice(8, -1).toLowerCase();
};

},{}]},{},[1])(1)
});