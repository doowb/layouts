'use strict';

require('mocha');
const assert = require('assert');
const layouts = require('..');

describe('buffers:', function() {
  beforeEach(() => layouts.clearCache());

  it('should support buffers.', function() {
    const obj = {
      abc: { contents: Buffer.from('blah above\n{% body %}\nblah below') }
    };

    const buffer = Buffer.from('This is content');
    const file = { contents: buffer, layout: 'abc', path: 'foo' };
    const actual = layouts(file, obj);

    assert.deepEqual(actual.contents.toString(), 'blah above\nThis is content\nblah below');
  });
});
