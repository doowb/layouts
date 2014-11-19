'use strict';

require('require-progress');

var createStack = require('layout-stack');
var typeOf = require('kind-of');
var _ = require('lodash');
var process = require('./lib/interpolate');

/**
 * @name layouts
 * @param {String} `str` The content string that should be wrapped with a layout.
 * @param {String} `name` The name of the layout to use.
 * @param {Object} `layout{s}` Object of layouts. `name` should be a key on this object.
 * @param {Object} `options`
 *     @option {Object} [options] `delims` Custom delimiters to use.
 *     @option {Object} [options] `defaultLayout` Default layout to use.
 * @return {String} Returns the original string, wrapped with a layout, or layout stack.
 * @api public
 */

module.exports = function wrapLayout(content, name, layouts, options) {
  options = options || {};

  var arr = createStack(name, layouts, options);
  var orig = content;
  var len = arr.length - 1;
  var layout;
  var i = 0;

  while (layout = layouts[arr[len--]]) {
    var res = content;
    try {
      res = process(layout.content, content, options);
    } catch(err) {
      if (options.debugLayouts) {
        delimiterError(name, options);
      }
    }
    content = res;
  }

  // if delimiters are wrong, the layout content might be returned
  // without inserting the original string. This prevents that.
  if (content.indexOf(orig) === -1 && options.debugLayouts) {
    delimiterError(name, options);
  }
  return content;
};

/**
 * Show a message in the console if it appears that there
 * is a delimiter mismatch. Since we don't know all use cases,
 * we can't assume this to be 100% reliable so for now
 * no errors will be thrown.
 *
 * @param {String} `name` The name of the template
 * @param {String} `opts`
 * @api private
 */

function delimiterError(name, opts) {
  var chalk = require('chalk');
  var msg = chalk.yellow('layout delimiter error for template: "' + name + '".');
  return console.log(msg + '\n', opts.regex);
}

/**
 * Get the native `typeof` a value.
 *
 * @api private
 */

function hasOwn(o, prop) {
  return {}.hasOwnProperty.call(o, prop);
}
