'use strict';

require('mocha');
var assert = require('assert');
var layouts = require('..');

describe('layouts', function() {
  var stack = {
    'default': {
      content: 'default above\n{% body %}\ndefault below',
      data: {scripts: ['main.js']},
      locals: {title: 'Quux'}
    },
    aaa: {
      content: 'aaa above\n{% body %}\naaa below',
      data: {scripts: ['aaa.js']},
      locals: {title: 'Foo'},
      layout: 'bbb'
    },
    bbb: {
      content: 'bbb above\n{% body %}\nbbb below',
      data: {scripts: ['bbb.js']},
      locals: {title: 'Bar'},
      layout: 'ccc'
    },
    ccc: {
      content: 'ccc above\n{% body %}\nccc below',
      data: {scripts: ['ccc.js']},
      locals: {title: 'Baz'},
      layout: 'default'
    },
    ddd: {
      content: 'ddd above\n{% body %}\nddd below',
      data: {scripts: ['ddd.js']},
      locals: {title: 'Baz'}
    }
  };

  it('should replace multiple tags', function() {
    var file = {content: 'This is content', layout: 'aaa', path: 'foo'};
    assert.deepEqual(layouts(file, stack).content, [
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
