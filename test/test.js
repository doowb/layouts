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
    var obj = {abc: {content: 'blah above\n{% body %}\nblah below'}};
    layouts('This is content', 'abc', obj).should.eql([
      'blah above',
      'This is content',
      'blah below'
    ].join('\n'));
  });

  it('should apply multiple layouts to the given string.', function () {
    var obj = {abc: {content: 'blah above\n{% body %}\n{% body %}\nblah below'}};
    layouts('This is content', 'abc', obj).should.eql([
      'blah above',
      'This is content',
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

  describe('custom tokens', function () {
    var stack2 = {
      'default': {content: 'default above\n{% foo %}\ndefault below', locals: {title: 'Quux'}},
      aaa: {content: 'aaa above\n{% foo %}\naaa below', locals: {title: 'Foo'}, layout: 'bbb'},
      bbb: {content: 'bbb above\n{% foo %}\nbbb below', locals: {title: 'Bar'}, layout: 'ccc'},
      ccc: {content: 'ccc above\n{% foo %}\nccc below', locals: {title: 'Baz'}, layout: 'default'},
      ddd: {content: 'ddd above\n{% foo %}\nddd below', locals: {title: 'Baz'} }
    };
    var stack3 = {
      'default': {content: 'default above\n[[ body ]]\ndefault below', locals: {title: 'Quux'}},
      aaa: {content: 'aaa above\n[[ body ]]\naaa below', locals: {title: 'Foo'}, layout: 'bbb'},
      bbb: {content: 'bbb above\n[[ body ]]\nbbb below', locals: {title: 'Bar'}, layout: 'ccc'},
      ccc: {content: 'ccc above\n[[ body ]]\nccc below', locals: {title: 'Baz'}, layout: 'default'},
      ddd: {content: 'ddd above\n[[ body ]]\nddd below', locals: {title: 'Baz'} }
    };
    var stack4 = {
      'default': {content: 'default above\n[[ foo ]]\ndefault below', locals: {title: 'Quux'}},
      aaa: {content: 'aaa above\n[[ foo ]]\naaa below', locals: {title: 'Foo'}, layout: 'bbb'},
      bbb: {content: 'bbb above\n[[ foo ]]\nbbb below', locals: {title: 'Bar'}, layout: 'ccc'},
      ccc: {content: 'ccc above\n[[ foo ]]\nccc below', locals: {title: 'Baz'}, layout: 'default'},
      ddd: {content: 'ddd above\n[[ foo ]]\nddd below', locals: {title: 'Baz'} }
    };

    it('should use a custom tag', function () {
      layouts(stack2.aaa.content, 'bbb', stack2, {tag: 'foo'}).should.eql([
        'default above',
        'ccc above',
        'bbb above',
        'aaa above',
        '{% foo %}',
        'aaa below',
        'bbb below',
        'ccc below',
        'default below'
      ].join('\n'));
    });

    it('should use custom delimiters', function () {
      layouts(stack3.aaa.content, 'bbb', stack3, {delims: ['[[', ']]']}).should.eql([
        'default above',
        'ccc above',
        'bbb above',
        'aaa above',
        '[[ body ]]',
        'aaa below',
        'bbb below',
        'ccc below',
        'default below'
      ].join('\n'));
    });

    it('should use custom delimiters and tag', function () {
      layouts(stack4.aaa.content, 'bbb', stack4, {tag: 'foo', delims: ['[[', ']]']}).should.eql([
        'default above',
        'ccc above',
        'bbb above',
        'aaa above',
        '[[ foo ]]',
        'aaa below',
        'bbb below',
        'ccc below',
        'default below'
      ].join('\n'));
    });
  });
});
