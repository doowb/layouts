'use strict';

require('mocha');
var File = require('vinyl');
var assert = require('assert');
var layouts = require('..');

describe('vinyl:', function() {
  var stack = {
    default: {
      path: 'default.html',
      contents: Buffer.from('default above\n{% body %}\ndefault below'),
      locals: { title: 'Quux' }
    },
    aaa: {
      path: 'aaa.html',
      contents: Buffer.from('aaa above\n{% body %}\naaa below'),
      locals: { title: 'Foo' },
      layout: 'bbb'
    },
    bbb: {
      path: 'bbb.html',
      contents: Buffer.from('bbb above\n{% body %}\nbbb below'),
      locals: { title: 'Bar' },
      layout: 'ccc'
    },
    ccc: {
      path: 'ccc.html',
      contents: Buffer.from('ccc above\n{% body %}\nccc below'),
      locals: { title: 'Baz' },
      layout: 'default'
    },
    ddd: {
      path: 'ddd.html',
      contents: Buffer.from('ddd above\n{% body %}\nddd below'),
      locals: { title: 'Baz' }
    }
  };

  function vinylize(stack) {
    var keys = Object.keys(stack);
    var len = keys.length;
    var res = {};

    while (len--) {
      var key = keys[len];
      res[key] = new File(stack[key]);
    }
    return res;
  }

  it('should support vinyl files', function() {
    var file = new File({ contents: Buffer.from('This is content'), layout: 'aaa', path: 'foo' });
    assert.deepEqual(layouts(file, vinylize(stack)).contents.toString(), [
      'default above',
      'ccc above',
      'bbb above',
      'aaa above',
      'This is content',
      'aaa below',
      'bbb below',
      'ccc below',
      'default below'
    ].join('\n'));
  });
});
