/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var util = require('util');
var isFalsey = require('falsey');
var Cache = require('config-cache');
var _ = require('lodash');
var delims = new (require('delims'))();

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
 * var layouts = new Layouts();
 * ```
 *
 * @param {Object} `cache` A template cache. See [Layouts#set](#set) for object details.
 * @param {Object} `options` Options to use.
 * @param {Array} `options.delims` Template delimiters to use formatted as an array (`['{{', '}}']`)
 * @param {String} `options.tag` The tag name to use. Default is `body` (e.g. `{{ body }}`)
 */

function Layouts(options) {
  Cache.call(this, options);
  this.options = _.extend({}, options);
  this.defaultTag = this.makeTag(this.options);
  this.mergeData = this.options.extend || _.extend;
  _.extend(this.cache, this.options.cache, this.options.layouts);
  this.context = _.extend({}, this.options.locals);

  delete this.options.cache;
  delete this.cache.data;

  this.flattenData(this.cache, 'cache');
}

util.inherits(Layouts, Cache);


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
  var opts = _.extend({}, this.options, options);
  opts.delims = opts.delims || ['{{', '}}'];
  opts.tag = opts.tag || 'body';

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
  var opts = _.extend({sep: '\\s*'}, this.options, options);
  var tag = this.makeTag(opts).replace(/[\]()[{|}]/g, '\\$&');
  return new RegExp(tag, opts.flags || 'g');
};


/**
 * ## .setLayout
 *
 * Store a template on the cache by its `name`, the `layout` to use,
 * and the template's `content.
 *
 * **Example:**
 *
 * ```js
 * layouts.setLayout('a', 'b', '<h1>Foo</h1>\n{{body}}\n');
 * ```
 *
 * @param {String|Object} `name` If `name` is a string, `layout` and `content` are required.
 * @param {String|Object} `data` Pass a string defining the name of layout to use for the given
 *                               template, or pass an object with a `layout` property.
 * @param {String} `content` The template "content", this will not be compiled or rendered.
 * @api public
 */

Layouts.prototype.setLayout = function (name, data, content) {
  if (arguments.length === 1 && typeof name === 'object') {
    _.extend(this.cache, name);
    return this;
  }

  this.cache[name] = {
    layout: (data && data.layout) ? data.layout : data,
    content: (data && data.content) ? data.content : content,
    data: data
  };

  return this;
};


/**
 * ## .getLayout
 *
 * Get a cached template by `name`.
 *
 * **Example:**
 *
 * ```js
 * layouts.getLayout('a');
 * //=> { layout: 'b', content: '<h1>Foo</h1>\n{{body}}\n' }
 * ```
 *
 * @param  {String} `name`
 * @return {Object} The template object to return.
 */

Layouts.prototype.getLayout = function (name) {
  if (!name) {
    return this.cache;
  }
  return this.cache[name];
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

Layouts.prototype.assertLayout = function (value, defaultLayout) {
  if (value === false || (value && isFalsey(value))) {
    return null;
  } else if (!value || value === true) {
    return defaultLayout || null;
  } else {
    return value;
  }
};


/**
 * ## .mergeData
 *
 * Extend `data` with the given `obj. A custom function can be
 * passed on `options.extend` to change how data is merged.
 *
 * @param  {*} `value`
 * @return {String|Null} Returns `true` or `null`.
 * @api private
 */

Layouts.prototype._mergeData = function (opts, tmpl) {
  this.mergeData(this.context, opts, opts.locals, tmpl, tmpl.data);
  var omit = ['extend', 'content', 'delims', 'layout', 'data', 'locals'];
  this.context = _.omit(this.context, omit);
  this.flattenData(this.context);
  return this;
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

Layouts.prototype.createStack = function (name, options) {
  var opts = _.extend({}, this.options, options);
  name = this.assertLayout(name, opts.defaultLayout);
  var template = Object.create(null);
  var stack = [];

  var prev = null;
  while (name && (prev !== name) && (template = this.cache[name])) {
    stack.unshift(name);
    prev = name;
    name = this.assertLayout(template.layout, opts.defaultLayout);
  }
  return stack;
};


/**
 * ## .stack
 *
 * Flatten nested layouts.
 *
 * **Example:**
 *
 * ```js
 * var layout = layouts.stack('base');
 * ```
 *
 * @param  {String} `name` The layout to start with.
 * @return {String} Resulting flattened layout.
 * @api private
 */

Layouts.prototype.stack = function (name, options) {
  var stack = this.createStack(name, options);
  var opts = _.extend(this.options, options);
  var data = {};

  var tag = this.makeTag(opts) || this.defaultTag;
  this.regex = this.makeRegex(opts);

  return _.reduce(stack, function (acc, layout) {
    var content = acc.content || tag;
    var tmpl = this.cache[layout];
    this._mergeData(opts, tmpl);

    content = content.replace(this.regex, tmpl.content);
    content = this.renderLayout(content, opts);

    return {
      data: this.context,
      content: content,
      regex: this.regex,
      tag: tag
    };
  }.bind(this), {});
};


/**
 * ## .renderLayout
 *
 * Render an individual layout layer with it's current context.
 *
 * **Example:**
 *
 * ```js
 * content = this.renderLayout(content, options);
 * ```
 * @param  {String} `content` content for the layout to render
 * @param  {Object} `options` additional options used for building the render settings
 * @return {String} rendered content
 */

Layouts.prototype.renderLayout = function (content, options) {
  var tag = (this.makeTag(options) || this.defaultTag).replace(/\s/g, '');
  var body = options.tag || 'body';
  var settings = _.extend(delims.templates(options.delims || ['{{','}}']), options);

  settings.interpolate = settings.evaluate;
  this.context[body] = tag;

  content = _.template(content, this.context, settings);
  delete this.context[body];

  return content
};


/**
 * ## .replaceTag
 *
 * Replace a `{{body}}` tag (or equivalent if custom delims are used) in `content`
 * with the given `str`.
 *
 * **Example:**
 *
 * ```js
 * console.log(layouts.replaceTag('ABC', 'Before {{body}} After'));
 * //=> 'Before ABC After'
 * ```
 *
 * @param  {String} `str` The string to use as a replacement value.
 * @param  {String} `content` A string with a `{{body}}` tag where the `str` should be injected.
 * @return {String} Resulting flattened content.
 * @api public
 */

Layouts.prototype.replaceTag = function (str, content, options) {
  return content.replace(this.makeRegex(options), str);
};


/**
 * ## .inject
 *
 * Inject content into a layout stack.
 *
 * **Example:**
 *
 * ```js
 * var page = layouts.inject(str, 'base');
 * var tmpl = _.template(page, context);
 * ```
 *
 * @param  {String} `str` The content to inject into the layout.
 * @param  {String} `name` The layout to start with.
 * @return {String} Resulting flattened layout.
 * @api public
 */

Layouts.prototype.inject = function (str, name, options) {
  var layout = this.stack(name, options);
  if (layout.content) {
    str = layout.content.replace(this.regex, str);
  }
  return {data: layout.data, content: str};
};


module.exports = Layouts;