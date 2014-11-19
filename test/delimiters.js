/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var layouts = require('..');


describe('layout delimiters', function () {
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

  it('should use default delimiters', function () {
    var obj = {abc: {content: '{%= body %}[[body]]{%body%}{% body %}<%body%>'}};
    layouts('INNER', 'abc', obj).should.eql('{%= body %}[[body]]{%body%}INNER<%body%>');
  });

  it('should use custom delimiters', function () {
    var obj = {abc: {content: '{%= body %}[[body]]{%body%}{% body %}<%body%>'}};
    layouts('INNER', 'abc', obj, {delims: ['<%', '%>']}).should.eql('{%= body %}[[body]]{%body%}{% body %}INNER');
  });
});
