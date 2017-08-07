'use strict';

require('mocha');
var toVinyl = require('to-vinyl');
var assert = require('assert');
var layouts = require('..');

describe('vinyl:', function() {
  var stack = {
    'default': {
      path: 'default.html',
      content: 'default above\n{% body %}\ndefault below',
      locals: {title: 'Quux'}
    },
    aaa: {
      path: 'aaa.html',
      content: 'aaa above\n{% body %}\naaa below',
      locals: {title: 'Foo'},
      layout: 'bbb'
    },
    bbb: {
      path: 'bbb.html',
      content: 'bbb above\n{% body %}\nbbb below',
      locals: {title: 'Bar'},
      layout: 'ccc'
    },
    ccc: {
      path: 'ccc.html',
      content: 'ccc above\n{% body %}\nccc below',
      locals: {title: 'Baz'},
      layout: 'default'
    },
    ddd: {
      path: 'ddd.html',
      content: 'ddd above\n{% body %}\nddd below',
      locals: {title: 'Baz'}
    }
  };

  function vinylize(stack) {
    var keys = Object.keys(stack);
    var len = keys.length;
    var res = {};

    while (len--) {
      var key = keys[len];
      res[key] = toVinyl(stack[key]);
    }
    return res;
  }

  it('should support vinyl files', function() {
    var file = toVinyl({content: 'This is content', layout: 'aaa', path: 'foo'});
    assert.deepEqual(layouts(file, vinylize(stack)).content, [
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
