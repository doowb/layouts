'use strict';

require('mocha');
const assert = require('assert');
const render = require('..');

describe('errors:', function() {
  beforeEach(() => render.clearCache());

  describe('file', function() {
    it('should throw an error when a file is not an object.', function() {
      assert.throws(() => render(), /expected file to be an object/);
    });

    it('should throw an error when a file.contents is not a buffer.', function() {
      assert.throws(() => render({ contents: '' }, {}), /expected file\.contents to be a buffer/);
    });
  });

  describe('layout', function() {
    it('should throw an error when a layout is not found.', function() {
      const obj = { abc: { path: 'blah', contents: Buffer.from('blah above\n{% body %}\nblah below') } };
      const file = { contents: Buffer.from('This is content'), layout: 'foobar', path: 'foo' };
      assert.throws(() => render(file, obj), /layout "foobar" is defined on "foo" but cannot be found/);
    });

    it('should throw an error when a layouts collection is not an object', function() {
      const file = { contents: Buffer.from('This is content'), layout: 'foobar', path: 'foo' };
      assert.throws(() => render(file), /expected layouts collection to be an object/);
    });

    it('should throw an error when layout.contents is not a buffer', function() {
      const obj = { default: { path: 'blah', contents: 'blah above\n{% body %}\nblah below' } };
      const file = { contents: Buffer.from('This is content'), layout: 'default', path: 'foo' };
      assert.throws(() => render(file, obj), /expected layout\.contents to be a buffer/);
    });
  });

  describe('properties', function() {
    it('should throw an error when the template does not exist', function() {
      assert.throws(function() {
        const file = { contents: Buffer.from('This is content'), layout: 'default', path: 'foo' };
        render(file, { blah: { path: '', contents: Buffer.from('foo') } });
      }, /layout "default" is defined on "foo" but cannot be found/);
    });
  });

  describe('body tag not found:', function() {
    it('should throw an error with default delimiters:', function() {
      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n{% foo %}\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        render(file, obj);
      }, /cannot find tag/);
    });

    it('should throw an error when custom tag is not found:', function() {
      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n{% bar %}\nblah below'), path: 'abc' } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        render(file, obj, { layoutDelims: ['{%', '%}'] });
      }, /cannot find tag/);

      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n{%= bar %}\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        render(file, obj, { layoutDelims: ['{%=', '%}'] });
      }, /cannot find tag/);

      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n{%- ody %}\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        render(file, obj, { layoutDelims: ['{%-', '%}'] });
      }, /cannot find tag/);

      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n<% ody %>\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        render(file, obj, { layoutDelims: ['<%', '%>'] });
      }, /cannot find tag/);

      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n<%= ody %>\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        render(file, obj, { layoutDelims: ['<%=', '%>'] });
      }, /cannot find tag/);

      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n<%- ody %>\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        render(file, obj, { layoutDelims: ['<%-', '%>'] });
      }, /cannot find tag/);
    });
  });

  describe('custom delimiters', function() {
    it('should throw an error when layout tag is not matched', function() {
      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n{% ody %}\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        render(file, obj, { layoutDelims: ['{{', '}}'] });
      }, /cannot find tag/);

      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n{{foo}}\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        render(file, obj, { layoutDelims: /{%([\s\S]+?)%}/g });
      }, /cannot find tag/);

      assert.throws(function() {
        const obj = { abc: { contents: Buffer.from('blah above\n{% ody %}\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
        render(file, obj, { layoutDelims: '{{([\\s\\S]+?)}}' });
      }, /cannot find tag/);
    });
  });
});
