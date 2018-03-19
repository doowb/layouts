'use strict';

require('mocha');
const assert = require('assert');
const layouts = require('..');

describe('errors:', function() {
  beforeEach(() => layouts.clearCache());

  describe('layout', function() {
    it('should throw an error when a layout is not found.', function() {
      assert.throws(function() {
        const obj = { abc: { path: 'blah', contents: Buffer.from('blah above\n{% body %}\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'foobar', path: 'foo' };
        layouts(file, obj);
      }, /layout foobar was not found/);
    });
  });

  describe('arguments', function() {
    it('should throw an error when invalid arguments are passed:', function() {
      assert.throws(function() {
        layouts();
      });
    });
  });

  describe('properties', function() {
    it('should throw an error when the template does not exist', function() {
      assert.throws(function() {
        const file = { contents: Buffer.from('This is content'), layout: 'default', path: 'foo' };
        layouts(file, { blah: { path: '', contents: Buffer.from('foo') } });
      }, /was not found/);
    });
  });

  describe('body tag not found:', function() {
    it('should throw an error with default delims:', function() {
      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n{% foo %}\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        layouts(file, obj);
      }, /cannot find tag/);
    });

    it('should throw an error when custom tag is not found:', function() {
      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n{% bar %}\nblah below'), path: 'abc' } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        layouts(file, obj, { layoutDelims: ['{%', '%}'] });
      }, /cannot find tag/);

      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n{%= bar %}\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        layouts(file, obj, { layoutDelims: ['{%=', '%}'] });
      }, /cannot find tag/);

      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n{%- ody %}\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        layouts(file, obj, { layoutDelims: ['{%-', '%}'] });
      }, /cannot find tag/);

      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n<% ody %>\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        layouts(file, obj, { layoutDelims: ['<%', '%>'] });
      }, /cannot find tag/);

      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n<%= ody %>\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        layouts(file, obj, { layoutDelims: ['<%=', '%>'] });
      }, /cannot find tag/);

      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n<%- ody %>\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        layouts(file, obj, { layoutDelims: ['<%-', '%>'] });
      }, /cannot find tag/);
    });
  });

  describe('custom delimiters', function() {
    it('should throw an error when layout tag is not matched', function() {
      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n{% ody %}\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        layouts(file, obj, { layoutDelims: ['{{', '}}'] });
      }, /cannot find tag/);

      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n{{foo}}\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        layouts(file, obj, { layoutDelims: /{%([\s\S]+?)%}/g });
      }, /cannot find tag/);

      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n{% ody %}\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        layouts(file, obj, { layoutDelims: '{{([\\s\\S]+?)}}' });
      }, /cannot find tag/);
    });
  });
});
