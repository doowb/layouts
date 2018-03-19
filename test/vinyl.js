'use strict';

require('mocha');
const File = require('vinyl');
const assert = require('assert');
const layouts = require('..');

describe('vinyl:', function() {
  beforeEach(() => layouts.clearCache());

  const stack = {
    default: new File({
      path: 'default.html',
      contents: Buffer.from('default above\n{% body %}\ndefault below'),
      locals: { title: 'Quux' }
    }),
    aaa: new File({
      path: 'aaa.html',
      contents: Buffer.from('aaa above\n{% body %}\naaa below'),
      locals: { title: 'Foo' },
      layout: 'bbb'
    }),
    bbb: new File({
      path: 'bbb.html',
      contents: Buffer.from('bbb above\n{% body %}\nbbb below'),
      locals: { title: 'Bar' },
      layout: 'ccc'
    }),
    ccc: new File({
      path: 'ccc.html',
      contents: Buffer.from('ccc above\n{% body %}\nccc below'),
      locals: { title: 'Baz' },
      layout: 'default'
    }),
    ddd: new File({
      path: 'ddd.html',
      contents: Buffer.from('ddd above\n{% body %}\nddd below'),
      locals: { title: 'Baz' }
    })
  };

  it('should support vinyl files', function() {
    const file = new File({ contents: Buffer.from('This is content'), layout: 'aaa', path: 'foo' });
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
