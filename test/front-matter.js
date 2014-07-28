/*!
 * nested layouts
 *
 * Copyright (c) 2014 nested layouts, contributors
 * Licensed under the MIT License (MIT)
 */

var fs = require('fs');
var path = require('path');
var should = require('should');
var matter = require('gray-matter');
var glob = require('globby');
var Layouts = require('..');
var layouts = new Layouts();

var page = function (filepath, opts) {
  var str = fs.readFileSync(filepath, 'utf8');
  var obj = matter(str, opts);
  return {
    name: path.basename(filepath, path.extname(filepath)),
    layout: obj.data && obj.data.layout,
    content: obj.content.replace(/^\s*/, '')
  };
};

glob.sync('test/fixtures/*.tmpl').forEach(function(filepath) {
  var obj = page(filepath);
  layouts.set(obj.name, obj.layout, obj.content);
});

describe('when nested layouts are defined in front-matter:', function () {
  it('should recursively inject content from each file into its layout.', function () {

    var actual = layouts.wrap('page');
    var expected = [
      'base!',
      'F above',
      'E above',
      'D above',
      'C above',
      'B above',
      'A above',
      'I\'m a <%= title %>', // should not be compiled
      'A below',
      'B below',
      'C below',
      'D below',
      'E below',
      'F below',
      'base!'
    ].join('\n');

    actual.should.eql(expected);
  });
});