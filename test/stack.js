'use strict';

require('mocha');
var union = require('arr-union');
var assert = require('assert');
var layouts = require('..');

describe('stack', function() {
  var stack = {
    'default': {
      content: 'default above\n{% body %}\ndefault below',
      data: {title: 'Quux', scripts: ['index.js']}
    },
    aaa: {
      content: 'aaa above\n{% body %}\naaa below',
      data: {title: 'Foo', scripts: ['aaa.js']},
      layout: 'bbb'
    },
    bbb: {
      content: 'bbb above\n{% body %}\nbbb below',
      data: {title: 'Bar', scripts: ['bbb.js']},
      layout: 'ccc'
    },
    ccc: {
      content: 'ccc above\n{% body %}\nccc below',
      data: {title: 'Baz', scripts: ['ccc.js']},
      layout: 'default'
    },
    ddd: {
      content: 'ddd above\n{% body %}\nddd below',
      data: {title: 'Baz', scripts: ['ddd.js']}
    }
  };

  it('should return an object with the layout history.', function() {
    var obj = {blah: {content: 'blah above\n{% body %}\nblah below'}};
    var file = {content: 'This is content', layout: 'blah', path: 'foo'};
    var actual = layouts(file, obj);
    assert(actual.hasOwnProperty('layoutStack'));
    assert(Array.isArray(actual.layoutStack));
  });

  it('should push all layouts onto the stack:', function() {
    var file = {content: 'This is content', layout: 'aaa', path: 'foo'};
    layouts(file, stack, function(file, layout) {
      file.data = file.data || {};
      file.data.scripts = union([], file.data.scripts, layout.data.scripts);
    });

    assert(file.data.hasOwnProperty('scripts'));
    assert.deepEqual(file.data.scripts, ['aaa.js', 'bbb.js', 'ccc.js', 'index.js']);
  });
});
