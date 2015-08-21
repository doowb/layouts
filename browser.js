(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.index = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var lazy = require('lazy-cache')(require);
lazy('falsey', 'isFalsey');
lazy('is-buffer', 'isBuffer');
lazy('delimiter-regex', 'delims');
lazy('get-value', 'get');

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
  if (lazy.isBuffer(str)) {
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
  if (value === false || (value && lazy.isFalsey(value))) {
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
      return toString(lazy.get(data, tagName.trim()));
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
    return (cache[syntax] = lazy.delims(syntax));
  }
}

/**
 * Cast `val` to a string.
 */

function toString(val) {
  return val == null ? '' : val.toString();
}

},{"lazy-cache":2}],2:[function(require,module,exports){
'use strict';

/**
 * Cache results of the first function call to ensure only calling once.
 *
 * ```js
 * var lazy = require('lazy-cache')(require);
 * // cache the call to `require('ansi-yellow')`
 * lazy('ansi-yellow', 'yellow');
 * // use `ansi-yellow`
 * console.log(lazy.yellow('this is yellow'));
 * ```
 *
 * @param  {Function} `fn` Function that will be called only once.
 * @return {Function} Function that can be called to get the cached function
 * @api public
 */

function lazyCache(fn) {
  var cache = {};
  var proxy = function (mod, name) {
    name = name || camelcase(mod);
    Object.defineProperty(proxy, name, {
      get: getter
    });

    function getter () {
      if (cache.hasOwnProperty(name)) {
        return cache[name];
      }
      try {
        return (cache[name] = fn(mod));
      } catch (err) {
        err.message = 'lazy-cache ' + err.message + ' ' + __filename;
        throw err;
      }
    };
    return getter;
  };
  return proxy;
}

/**
 * Used to camelcase the name to be stored on the `lazy` object.
 *
 * @param  {String} `str` String containing `_`, `.`, `-` or whitespace that will be camelcased.
 * @return {String} camelcased string.
 */

function camelcase(str) {
  if (str.length === 1) { return str.toLowerCase(); }
  str = str.replace(/^[\W_]+|[\W_]+$/g, '').toLowerCase();
  return str.replace(/[\W_]+(\w|$)/g, function (_, ch) {
    return ch.toUpperCase();
  });
}

/**
 * Expose `lazyCache`
 */

module.exports = lazyCache;

},{}]},{},[1])(1)
});