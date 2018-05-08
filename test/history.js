'use strict';

require('mocha');
const union = require('arr-union');
const assert = require('assert');
const layouts = require('..');

describe('stack', function() {
  beforeEach(() => layouts.clearCache());

  const stack = {
    default: {
      contents: Buffer.from('default above\n{% body %}\ndefault below'),
      data: { title: 'Quux', scripts: ['index.js'] }
    },
    aaa: {
      contents: Buffer.from('aaa above\n{% body %}\naaa below'),
      data: { title: 'Foo', scripts: ['aaa.js'] },
      layout: 'bbb'
    },
    bbb: {
      contents: Buffer.from('bbb above\n{% body %}\nbbb below'),
      data: { title: 'Bar', scripts: ['bbb.js'] },
      layout: 'ccc'
    },
    ccc: {
      contents: Buffer.from('ccc above\n{% body %}\nccc below'),
      data: { title: 'Baz', scripts: ['ccc.js'] },
      layout: 'default'
    },
    ddd: {
      contents: Buffer.from('ddd above\n{% body %}\nddd below'),
      data: { title: 'Baz', scripts: ['ddd.js'] }
    }
  };

  it('should return an object with the layout history.', function() {
    const obj = { blah: { contents: Buffer.from('blah above\n{% body %}\nblah below') } };
    const file = { contents: Buffer.from('This is content'), layout: 'blah', path: 'foo' };
    const actual = layouts(file, obj, { keepStack: true });
    assert(actual.hasOwnProperty(layouts.stack));
    assert(Array.isArray(actual[layouts.stack]));
  });

  it('should push all layouts onto the stack:', function() {
    const file = { contents: Buffer.from('This is content'), layout: 'aaa', path: 'foo' };
    layouts(file, stack, function(file, layout) {
      file.data = file.data || {};
      file.data.scripts = union([], file.data.scripts, layout.data.scripts);
    });
    assert(file.data.hasOwnProperty('scripts'));
    assert.deepEqual(file.data.scripts, ['aaa.js', 'bbb.js', 'ccc.js', 'index.js']);
  });
});
