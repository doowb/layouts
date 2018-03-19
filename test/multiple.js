'use strict';

require('mocha');
const assert = require('assert');
const layouts = require('..');

describe('layouts', function() {
  const stack = {
    default: {
      contents: Buffer.from('default above\n{% body %}\ndefault below'),
      data: { scripts: ['main.js'] },
      locals: { title: 'Quux' }
    },
    aaa: {
      contents: Buffer.from('aaa above\n{% body %}\naaa below'),
      data: { scripts: ['aaa.js'] },
      locals: { title: 'Foo' },
      layout: 'bbb'
    },
    bbb: {
      contents: Buffer.from('bbb above\n{% body %}\nbbb below'),
      data: { scripts: ['bbb.js'] },
      locals: { title: 'Bar' },
      layout: 'ccc'
    },
    ccc: {
      contents: Buffer.from('ccc above\n{% body %}\nccc below'),
      data: { scripts: ['ccc.js'] },
      locals: { title: 'Baz' },
      layout: 'default'
    },
    ddd: {
      contents: Buffer.from('ddd above\n{% body %}\nddd below'),
      data: { scripts: ['ddd.js'] },
      locals: { title: 'Baz' }
    }
  };

  it('should replace multiple tags', function() {
    const file = { contents: Buffer.from('This is content'), layout: 'aaa', path: 'foo' };
    assert.deepEqual(layouts(file, stack).contents.toString(), [
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
