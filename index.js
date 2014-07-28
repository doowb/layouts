'use strict';

var _ = require('lodash');
var isFalsey = require('falsey');


/**
 * Wrap pages with nested layouts.
 *
 * @param {Object} `cache` Optionally pass a template cache.
 */

var Layouts = function Layouts(cache) {
  this.cache = cache || {};
};


Layouts.prototype.useLayout = function (layout) {
  if (!layout || isFalsey(layout)) {
    return null;
  }
  return layout;
};


Layouts.prototype.set = function (name, layout, content) {
  if (arguments.length === 1 && typeof name === 'object') {
    _.extend(this.cache, name);
    return this;
  }
  this.cache[name] = {layout: layout, content: content};
  return this;
};


Layouts.prototype.get = function (name) {
  if (!name) {
    return this.cache;
  }
  return this.cache[name];
};


Layouts.prototype.createStack = function (name) {
  name = this.useLayout(name);
  var template = Object.create(null);
  var stack = [];

  while (name && (template = this.get(name))) {
    stack.unshift(name);
    name = this.useLayout(template.layout);
  }
  return stack;
};


Layouts.prototype.wrap = function (name, options) {
  var opts = _.extend({}, options);
  var tag = opts.tag || /\{{\s*body\s*}}/;
  var stack = this.createStack(name);
  var result = {};

  result = stack.reduce(function (acc, layout) {
    var tmpl = this.get(layout);
    var content = acc.content || '{{body}}';
    result.content = content.replace(tag, tmpl.content)
    return result;
  }.bind(this), result).content;
};

module.exports = Layouts;