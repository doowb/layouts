'use strict';

var path = require('path');
var util = require('util');
var Delims = require('delims');
var delims = new Delims();
var Options = require('option-cache');
var slice = require('array-slice');
var layout = require('./wrap');
var _ = require('lodash');
var extend = _.extend;

/**
 * Example application using load-templates
 *
 * ```js
 * var Engine = require('engine');
 * var engine = new Engine();
 * ```
 *
 * @param {[type]} options
 */

function Engine(options) {
  Options.call(this, options);
  this.cache = {};
  this.defaultTemplates();
  this.defaultOptions();

  if (this.enabled('debug')) {
    this.debug();
  }
}

util.inherits(Engine, Options);

/**
 * Add some default template "types"
 */

Engine.prototype.defaultOptions = function () {
  this.option('delims', {
    content: ['<%', '%>'],
    layouts: ['{%', '%}']
  });
  this.disable('debug');
};

/**
 * Add some default template "types"
 */

Engine.prototype.debug = function () {
  this.enable('debugLayouts');
  this.enable('debugEngines');
};


/**
 * Add some default template "types"
 */

Engine.prototype.defaultTemplates = function () {
  this.create('page', 'pages', { isRenderable: true });
  this.create('partial', 'partials', { isPartial: true });
  this.create('layout', 'layouts', { isLayout: true });
};

/**
 * Normalize values and return a template object.
 *
 * @param {String} `key`
 * @param {Object} `value`
 * @param {Object} `locals`
 * @param {Object} `options`
 * @return {Object}
 * @api private
 */

Engine.prototype.load = function (key, value, locals, options) {
  if (typeof value === 'string') {
    value = {content: value};
  }
  var o = value || {};
  o.locals = locals || {};
  o.options = options || {};
  o.layout = o.layout || o.locals.layout || o.options.layout;
  return o;
};


/**
 * Given an object of `layouts`, and the `name` of a starting layout,
 * build the layout stack for the given `string`, then wrap and return
 * the string.
 *
 * @param {String} `str` The content string that should be wrapped with a layout.
 * @param {String} `name` The name of the layout to use.
 * @param {Object} `layouts` Object of layouts. `name` should be a key on this object.
 * @return {String} Returns the original string, wrapped with a layout, or layout stack.
 * @api public
 */

Engine.prototype.applyLayout = function (name, collection, options) {
  var template = this.cache[collection][name];
  var name = template.layout || template.locals.layout;
  var opts = extend({}, this.options, options);
  var re = delims.templates(opts.delims && opts.delims.layouts);
  opts.settings = _.extend({}, opts.settings, re);
  return layout(template.content, name, this.cache.layouts, opts);
};

/**
 * Create template "types"
 *
 * @param  {String} `type` The singular name of the type, e.g. `page`
 * @param  {String} `plural` The plural name of the type, e.g. `pages.
 * @return {String}
 */

Engine.prototype.create = function (type, plural, options) {
  this.cache[plural] = this.cache[plural] || {};

  Engine.prototype[type] = function (key, value, locals, opt) {
    return this[plural].apply(this, arguments);
  };

  Engine.prototype[plural] = function (key, value, locals, opt) {
    var args = slice(arguments);
    var opts = _.extend({}, options, args.pop());
    console.log(opts)
    this.cache[plural][key] = this.load.apply(this, arguments);
    return this;
  };

  return this;
};

var engine = new Engine();

engine
  .layout('default', '[default]<%= body %>[default]', {name: 'Brian Woodward'})
  .layout('aaa', '[aaa]<%= body %>[aaa]', {layout: 'bbb'})
  .layout('bbb', '[bbb]<%= body %>[bbb]', {layout: 'default'})
  .layout('ccc', '[ccc]<%= body %>[ccc]')
  .layout('ccc', '[ccc]<% body %>[ccc]')
  .layout('eee', '[eee]{% body %}[eee]')

engine.partial('sidebar', 'This is a sidebar.', {layout: 'eee'}, {delims: {layouts: ['{%', '%}']}});
// engine.page('home', {content: 'This is content'}, { engine: 'lodash' });
// engine.page('about', {content: 'This is content'}, { engine: 'hbs' });
// engine.page('contact', {content: 'This is content', layout: 'default'}, { engine: 'hbs' });

var a = engine.applyLayout('sidebar', 'partials');
// var b = engine.applyLayout('contact', 'pages');
console.log(a)
// console.log(b)
// console.log(util.inspect(engine, null, 10));

