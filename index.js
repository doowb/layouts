/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var isFalsey = require('falsey');
var _ = require('lodash');


/**
 * ## Layouts
 *
 * Create a new instance of `Layouts`, optionally passing the default
 * `cache` and `options` to use.
 *
 * **Example:**
 *
 * ```js
 * var Layouts = require('layouts');
 * var layout = new Layouts();
 * ```
 *
 * @param {Object} `cache` A template cache. See [Layouts#set](#set) for object details.
 * @param {Object} `options` Options to use.
 * @param {Array} `options.delims` Template delimiters to use formatted as an array (`['{{', '}}']`)
 * @param {String} `options.tag` The tag name to use. Default is `body` (e.g. `{{ body }}`)
 */

var Layouts = module.exports = function Layouts(options) {
  var opts = _.defaults({}, options, {
    delims: ['{{', '}}'],
    tag: 'body'
  });

  this.cache = Object.create(opts.cache || null);
  this.extend = opts.extend || _.extend;
  this.defaultTag = this.makeTag(opts);
  this.regex = this.makeRegex(opts);
};


/**
 * ## .makeTag
 *
 * Generate the default body tag to use as a fallback, based on the
 * `tag` and `delims` defined in the options.
 *
 * @param  {Object} options
 * @return {String} The actual body tag, e.g. `{{ body }}`
 * @api private
 */

Layouts.prototype.makeTag = function (options) {
  var opts = _.extend({}, options);
  return [
    opts.delims[0],
    opts.tag,
    opts.delims[1]
  ].join(opts.sep || ' ');
};


/**
 * ## .makeRegex
 *
 * Return a regular expression for the "body" tag based on the
 * `tag` and `delims` defined in the options.
 *
 * @param  {Object} `options`
 * @return {RegExp}
 * @api private
 */

Layouts.prototype.makeRegex = function (options) {
  var opts = _.extend({sep: '\\s*'}, options);
  return new RegExp(this.makeTag(opts), opts.flags);
};


/**
 * ## .set
 *
 * Store a template on the cache by its `name`, the `layout` to use,
 * and the template's `content.
 *
 * **Example:**
 *
 * ```js
 * layout.set('a', 'b', '<h1>Foo</h1>\n{{body}}\n');
 * ```
 *
 * @param {String|Object} `name` If `name` is a string, `layout` and `content` are required.
 * @param {String|Object} `data` Pass a string defining the name of layout to use for the given
 *                               template, or pass an object with a `layout` property.
 * @param {String} `content` The template "content", this will not be compiled or rendered.
 * @api public
 */

Layouts.prototype.set = function (name, data, content) {
  if (arguments.length === 1 && typeof name === 'object') {
    _.extend(this.cache, name);
    return this;
  }

  this.cache[name] = {
    layout: (data && data.layout) ? data.layout : data,
    content: content,
    data: data
  };
  return this;
};


/**
 * ## .get
 *
 * Get a cached template by `name`.
 *
 * **Example:**
 *
 * ```js
 * layout.get('a');
 * //=> { layout: 'b', content: '<h1>Foo</h1>\n{{body}}\n' }
 * ```
 *
 * @param  {String} `name`
 * @return {Object} The template object to return.
 */

Layouts.prototype.get = function (name) {
  if (!name) {
    return this.cache;
  }
  return this.cache[name];
};


/**
 * ## .extendData
 *
 * Assert whether or not a layout should be used based on
 * the given `value`. If a layout should be used, the name of the
 * layout is returned, if not `null` is returned.
 *
 * @param  {*} `value`
 * @return {String|Null} Returns `true` or `null`.
 * @api private
 */

Layouts.prototype.extendData = function (obj, data) {
  if (typeof obj.data === 'object') {
    this.extend(data, obj.data);
  }
  delete data.layout;
  return data;
};



/**
 * ## .assertLayout
 *
 * Assert whether or not a layout should be used based on
 * the given `value`. If a layout should be used, the name of the
 * layout is returned, if not `null` is returned.
 *
 * @param  {*} `value`
 * @return {String|Null} Returns `true` or `null`.
 * @api private
 */

Layouts.prototype.assertLayout = function (value) {
  if (!value || isFalsey(value)) {
    return null;
  }
  return value;
};


/**
 * ## .createStack
 *
 * Build a layout stack.
 *
 * @param  {String} `name` The name of the layout to add to the stack.
 * @return {String}
 * @api private
 */

Layouts.prototype.createStack = function (name) {
  name = this.assertLayout(name);
  var template = Object.create(null);
  var stack = [];

  while (name && (template = this.cache[name])) {
    stack.unshift(name);
    name = this.assertLayout(template.layout);
  }
  return stack;
};


/**
 * ## .wrap
 *
 * Flatten nested layouts.
 *
 * **Example:**
 *
 * ```js
 * var page = layout.wrap('base');
 * var tmpl = _.template(page, context);
 * ```
 *
 * @param  {String} `name` The layout to start with.
 * @return {String} Resulting flattened layout.
 * @api public
 */

Layouts.prototype.wrap = function (name) {
  var stack = this.createStack(name);
  var data = {};

  return _.reduce(stack, function (acc, layout) {
    var tmpl = this.cache[layout];
    var content = acc.content || this.defaultTag;
    return {
      data: this.extendData(tmpl, data),
      content: content.replace(this.regex, tmpl.content)
    };
  }.bind(this), {});
};

