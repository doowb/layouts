'use strict';

require('mocha');
const assert = require('assert');
const layouts = require('..');

describe('preserve whitespace', function() {
  beforeEach(() => layouts.clearCache());

  it('should preserve the whitespace on a given string.', function() {
    const collection = { blah: { contents: Buffer.from('blah above\n  {% body %}\nblah below') } };
    const file = {
      contents: Buffer.from('first line of content\nsecond line of content'),
      layout: 'blah',
      path: 'foo'
    };

    const expected = 'blah above\n  first line of content\n  second line of content\nblah below';
    const actual = layouts(file, collection, { preserveWhitespace: true });
    assert.deepEqual(actual.contents.toString(), expected);
  });

  it('should preserve the whitespace on a given string in multiple layouts.', function() {
    const collection = {
      one: { contents: Buffer.from('one above\n  {% body %}\none below') },
      two: { contents: Buffer.from('two above\n  {% body %}\ntwo below'), layout: 'one' },
      three: { contents: Buffer.from('three above\n  {% body %}\nthree below'), layout: 'two' },
      four: { contents: Buffer.from('four above\n  {% body %}\nfour below'), layout: 'three' }
    };

    const file = { contents: Buffer.from('This is content'), layout: 'four', path: 'foo' };
    const expected = [
      'one above',
      '  two above',
      '    three above',
      '      four above',
      '        This is content',
      '      four below',
      '    three below',
      '  two below',
      'one below'
    ].join('\n');

    const actual = layouts(file, collection, { preserveWhitespace: true });
    assert.deepEqual(actual.contents.toString(), expected);
  });
});
