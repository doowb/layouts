'use strict';

var isFalsey = require('falsey');
var process = require('./lib/interpolate');
var chalk = require('chalk');
var _ = require('lodash');

/**
 * Given an object of `layouts`, and the `name` of a starting layout:
 *  1. build a layout stack (array of layouts) for the given `string`, then
 *  1. iterate over the stack, wrapping each layout in the stack around the string
 *
 * @param {String} `str` The content string that should be wrapped with a layout.
 * @param {String} `name` The name of the layout to use.
 * @param {Object} `layouts` Object of layouts. `name` should be a key on this object.
 * @param {Object} `options`
 *     @option {Object} [options] `settings` Optionally pass an object of delimiters to pass to Lo-Dash
 *     @option {Object} [options] `defaultLayout` Optionally pass the name of the default layout to use.
 * @return {String} Returns the original string, wrapped with a layout, or layout stack.
 * @api public
 */

var wrap = module.exports = function wrap(str, name, layouts, options) {
  options = options || {};

  var arr = createStack(name, layouts, options);
  var orig = str;
  var len = arr.length;
  var layout;
  var i = 0;

  while (layout = layouts[arr[i++]]) {
    var res = str;
    try {
      // Check the options and locals of the actual layout to see if another
      // layout is defined.
      //
      // TODO: this should not be here. Instead, we should expose an option
      // to pass a "pick layout" function
      var opts = _.extend({}, options, layout.locals, layout.options);
      var delims = opts.delims.layout || opts.delims;

      // actually render the layout
      res = process(layout.content, {body: str}, delims);
    } catch(err) {
      if (options.debugLayouts) {
        delimiterError(name, options);
      }
    }
    str = res;
  }

  // if delimiters are wrong, the layout content might be returned
  // without inserting the original string. This prevents that.
  if (str.indexOf(orig) === -1 && options.debugLayouts) {
    delimiterError(name, options);
  }
  return str;
};

function delimiterError(name, options) {
  var msg = chalk.yellow('layout delimiter error for template: "' + name + '".');
  return console.log(msg + '\n', options.regex);
}

function pickLayout(template, options) {
  var opts = _.extend({}, options, template.locals, template.options);
  return opts.delims.layout || opts.delims;
}

function createStack(name, layouts, options) {
  var template = {};
  var stack = [];
  var prev = null;

  while (name && (prev !== name) && (template = layouts[name])) {
    stack.unshift(name);
    prev = name;
    name = assertLayout(template.layout, options.defaultLayout);
  }
  return stack;
}

function assertLayout(value, defaultLayout) {
  if (value === false || (value && isFalsey(value))) {
    return null;
  } else if (!value || value === true) {
    return defaultLayout || null;
  } else {
    return value;
  }
}
