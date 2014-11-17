'use strict';

var path = require('path');
var util = require('util');
var slice = require('array-slice');
var layouts = require('./wrap');
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
  this.options = options || {};
  this.cache = {};
  this.defaultTemplates();
}

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
  var template = value || {};
  template.locals = locals || {};
  template.options = options || {};
  return template;
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

Engine.prototype.applyLayout = function (name, collection) {
  var template = this.cache[collection][name];
  var layout = template.locals.layout;
  return layouts(template.content, layout, this.cache.layouts);
};

/**
 * Create template "types"
 *
 * @param  {String} `type` The singular name of the type, e.g. `page`
 * @param  {String} `plural` The plural name of the type, e.g. `pages.
 * @return {String}
 */

Engine.prototype.create = function (type, plural, options, cb) {
  this.cache[plural] = this.cache[plural] || {};

  Engine.prototype[type] = function (key, value, locals, options) {
    return this[plural].apply(this, arguments);
  };

  Engine.prototype[plural] = function (key, value, locals, options) {
    this.cache[plural][key] = this.load.apply(this, arguments);
    return this;
  };

  return this;
};

var engine = new Engine();

engine
  .layout('default', '[default]<%= body %>[default]', {name: 'Brian Woodward'})
  .layout('aaa', '[aaa]<%= body %>[aaa]', {name: 'Brian Woodward', layout: 'bbb'})
  .layout('bbb', '[bbb]<%= body %>[bbb]', {name: 'Brian Woodward', layout: 'default'});
engine.partial('aaa', 'This is content', {name: 'Brian Woodward', layout: 'aaa'});
engine.page('aaa', {content: 'This is content'}, {name: 'Brian Woodward'}, { engine: 'lodash' });
engine.page('bbb', {content: 'This is content'}, {name: 'Brian Woodward'}, { engine: 'hbs' });

var res = engine.applyLayout('aaa', 'partials');
console.log(res)
// console.log(util.inspect(engine, null, 10));
