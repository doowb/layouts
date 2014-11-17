/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var layouts = require('..');

describe('.layouts():', function () {

  var stack = {
    'default': {
      content: 'default above\n{% body %}\ndefault below',
      locals: {title: 'Quux'}
    },
    aaa: {
      content: 'aaa above\n{% body %}\naaa below',
      locals: {title: 'Foo'},
      layout: 'bbb'
    },
    bbb: {
      content: 'bbb above\n{% body %}\nbbb below',
      locals: {title: 'Bar'},
      layout: 'ccc'
    },
    ccc: {
      content: 'ccc above\n{% body %}\nccc below',
      locals: {title: 'Baz'},
      layout: 'default'
    },
    ddd: {
      content: 'ddd above\n{% body %}\nddd below',
      locals: {title: 'Baz'}
    }
  };

  it('should apply a layout to the given string.', function () {
    var obj = {blah: {content: 'blah above\n{% body %}\nblah below'}};
    layouts('This is content', 'blah', obj).should.eql([
      'blah above',
      'This is content',
      'blah below'
    ].join('\n'));
  });

  it('should replace the `{%= body %}` tag in a layout with the given content.', function () {
    layouts('This is content', 'aaa', stack).should.eql([
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

  it('should not replace the `{%= body %}` tag when no content is given to replace it.', function () {
    layouts(stack.aaa.content, 'bbb', stack).should.eql([
      'default above',
      'ccc above',
      'bbb above',
      'aaa above',
      '{% body %}',
      'aaa below',
      'bbb below',
      'ccc below',
      'default below'
    ].join('\n'));
  });
});
