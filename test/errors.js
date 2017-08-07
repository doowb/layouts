'use strict';

require('mocha');
var assert = require('assert');
var layouts = require('..');

describe('errors:', function() {
  describe('arguments', function() {
    it('should throw an error when invalid arguments are passed:', function() {
      assert.throws(function() {
        layouts();
      });
    });
  });

  describe('properties', function() {
    it('should throw an error when file.path is not a string', function() {
      assert.throws(function() {
        layouts({content: 'This is content'}, {});
      });
    });

    it('should throw an error when layout name is not defined', function() {
      assert.throws(function() {
        layouts({content: 'This is content', path: 'foo'}, {});
      });
    });

    it('should throw an error when the template does not exist', function() {
      assert.throws(function() {
        var file = {content: 'This is content', layout: 'blah', path: 'foo'};
        layouts(file, {blah: {content: 'foo'}});
      });
    });
  });

  describe('body tag not found:', function() {
    it('should throw an error with default delims:', function() {
      assert.throws(function() {
        var obj = {abc: {content: 'blah above\n{% foo %}\nblah below'}};
        var file = {content: 'This is content', layout: 'abc', path: 'foo'};
        layouts(file, obj);
      });
    });

    it('should throw an error when custom tag is not found:', function() {
      assert.throws(function() {
        var obj = {abc: {content: 'blah above\n{% bar %}\nblah below', path: 'abc'}};
        var file = {content: 'This is content', layout: 'abc', path: 'foo'};
        layouts(file, obj, {layoutDelims: ['{%', '%}']});
      });

      assert.throws(function() {
        var obj = {abc: {content: 'blah above\n{%= bar %}\nblah below'}};
        var file = {content: 'This is content', layout: 'abc', path: 'foo'};
        layouts(file, obj, {layoutDelims: ['{%=', '%}']});
      });

      assert.throws(function() {
        var obj = {abc: {content: 'blah above\n{%- ody %}\nblah below'}};
        var file = {content: 'This is content', layout: 'abc', path: 'foo'};
        layouts(file, obj, {layoutDelims: ['{%-', '%}']});
      });

      assert.throws(function() {
        var obj = {abc: {content: 'blah above\n<% ody %>\nblah below'}};
        var file = {content: 'This is content', layout: 'abc', path: 'foo'};
        layouts(file, obj, {layoutDelims: ['<%', '%>']});
      });

      assert.throws(function() {
        var obj = {abc: {content: 'blah above\n<%= ody %>\nblah below'}};
        var file = {content: 'This is content', layout: 'abc', path: 'foo'};
        layouts(file, obj, {layoutDelims: ['<%=', '%>']});
      });

      assert.throws(function() {
        var obj = {abc: {content: 'blah above\n<%- ody %>\nblah below'}};
        var file = {content: 'This is content', layout: 'abc', path: 'foo'};
        layouts(file, obj, {layoutDelims: ['<%-', '%>']});
      });
    });
  });

  describe('custom delimiters', function() {
    it('should throw an error when custom delims are an array:', function() {
      assert.throws(function() {
        var obj = {abc: {content: 'blah above\n{% ody %}\nblah below'}};
        var file = {content: 'This is content', layout: 'abc', path: 'foo'};
        layouts(file, obj, {layoutDelims: ['{{', '}}']});
      });
    });

    it('should throw an error when tag is missing with custom regex', function() {
      assert.throws(function() {
        var obj = {abc: {content: 'blah above\n{{foo}}\nblah below'}};
        var file = {content: 'This is content', layout: 'abc', path: 'foo'};
        layouts(file, obj, {layoutDelims: /\{%([\s\S]+?)%}/g});
      });
    });

    it('should throw an error when custom delims are a string:', function() {
      assert.throws(function() {
        var obj = {abc: {content: 'blah above\n{% ody %}\nblah below'}};
        var file = {content: 'This is content', layout: 'abc', path: 'foo'};
        layouts(file, obj, {layoutDelims: '{{([\\s\\S]+?)}}'});
      });
    });

    it('should throw an error when a layout is not applied.', function() {
      assert.throws(function() {
        var obj = {abc: {path: 'blah', content: 'blah above\n{% body %}\nblah below'}};
        var file = {content: 'This is content', layout: 'foobar', path: 'foo'};
        layouts(file, obj);
      });
    });
  });
});
