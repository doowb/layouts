'use strict';

require('mocha');
var assert = require('assert');
var layouts = require('..');

describe('buffers:', function() {
  it('should support buffers.', function() {
    var obj = {
      abc: {content: new Buffer('blah above\n{% body %}\nblah below')}
    };

    var buffer = new Buffer('This is content');
    var file = {contents: buffer, layout: 'abc', path: 'foo'};
    var actual = layouts(file, obj);

    assert.deepEqual(actual.content, [
      'blah above',
      'This is content',
      'blah below'
    ].join('\n'));
  });
});
