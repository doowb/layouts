'use strict';

var isFalsey = require('falsey');
var process = require('interpolate');
var chalk = require('chalk');
var _ = require('lodash');

var layouts = {
  'default': {
    content: '[default]<%= body %>[default]',
    locals: {title: 'Quux'}
  },
  aaa: {
    content: '[aaa]<%= body %>[aaa]',
    locals: {title: 'Foo'},
    layout: 'bbb'
  },
  bbb: {
    content: '[bbb]<%= body %>[bbb]',
    locals: {title: 'Bar'},
    layout: 'ccc'
  },
  ccc: {
    content: '[ccc]<%= body %>[ccc]',
    locals: {title: 'Baz'},
    layout: 'default'
  },
  ddd: {
    content: '[ddd]<%= body %>[ddd]',
    locals: {title: 'Baz'}
  }
};

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
  var msg = chalk.yellow('[layouts] layout delimiters appear to be wrong.');

  options = options || {};
  var arr = createStack(name, layouts, options);
  var orig = str;
  var len = arr.length;
  var layout;
  var i = 0;

  while (layout = layouts[arr[i++]]) {
    var res = str;
    try {
      res = _.template(layout.content, {body: str}, options.settings);
    } catch(err) {
      if (options.debug) {
        console.log(err);
        console.log(msg);
      }
    }
    str = res;
  }

  // if delimiters are wrong, the layout content might be returned
  // without inserting the original string. This prevents that.
  if (str.indexOf(orig) === -1) {
    if (options.debug) {
      console.log(msg);
    }
    return orig;
  }

  return str;
};

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

// console.log(wrap('This is content.', 'aaa', layouts, {defaultLayout: undefined}));
// console.log(wrap('This is content.', 'ddd', layouts, {defaultLayout: 'default'}));