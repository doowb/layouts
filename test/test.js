'use strict';

require('mocha');
var assert = require('assert');
var layouts = require('..');

describe('layouts', function() {
  var stack = {
    multiple: {
      content: 'blah above\n{% body %}\n{% body %}\nblah below'
    },
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

  it('should apply a layout to the given string.', function() {
    var obj = {abc: {content: 'blah above\n{% body %}\nblah below'}};
    var file = {content: 'This is content', layout: 'abc', path: 'foo'};
    assert.deepEqual(layouts(file, obj).content, [
      'blah above',
      'This is content',
      'blah below'
    ].join('\n'));
  });

  describe('when a defaultLayout is defined', function() {
    it('should not apply a layout if the name is an empty string:', function() {
      var obj = {abc: {content: 'blah above\n{% body %}\nblah below'}};
      var file = {content: 'This is content', layout: '', path: 'foo'};
      assert.deepEqual(layouts(file, obj, {defaultLayout: 'abc'}).content, [
        'This is content'
      ].join('\n'));
    });

    it('should throw an error if layout is specified and not found', function() {
      assert.throws(function() {
        var obj = {abc: {path: 'blah', content: 'blah above\n{% body %}\nblah below'}};
        var file = {content: 'This is content', layout: 'ffo', path: 'foo'};
        layouts(file, obj, {defaultLayout: 'abc'});
      });
    });
  });

  it('should not apply a layout when the layout name is falsey', function() {
    var obj = {abc: {content: 'blah above\n{% body %}\nblah below'}};
    function createFile(name) {
      return {content: 'This is content', layout: name, path: 'foo'};
    }
    assert.deepEqual(layouts(createFile('none'), obj).content, 'This is content');
    assert.deepEqual(layouts(createFile('no'), obj).content, 'This is content');
    assert.deepEqual(layouts(createFile(null), obj).content, 'This is content');
    assert.deepEqual(layouts(createFile('null'), obj).content, 'This is content');
    assert.deepEqual(layouts(createFile(false), obj).content, 'This is content');
    assert.deepEqual(layouts(createFile('false'), obj).content, 'This is content');
    assert.deepEqual(layouts(createFile('nil'), obj).content, 'This is content');
  });

  describe('apply layouts.', function() {
    it('should support multiple body tags', function() {
      var file = {
        content: 'This is content',
        layout: 'multiple',
        path: 'foo'
      };

      assert.deepEqual(layouts(file, stack).content, [
        'blah above',
        'This is content',
        'This is content',
        'blah below'
      ].join('\n'));
    });

    it('should replace the `{%= body %}` tag with content.', function() {
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

    it('should not replace the `{%= body %}` tag when no content is passed.', function() {
      var file = {content: stack.aaa.content, layout: 'bbb', path: 'foo'};
      assert.deepEqual(layouts(file, stack).content, [
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

  describe('custom placeholders', function() {
    var stack2 = {
      'default': {content: 'default above\n{% foo %}\ndefault below', locals: {title: 'Quux'}},
      aaa: {content: 'aaa above\n{% foo %}\naaa below', locals: {title: 'Foo'}, layout: 'bbb'},
      bbb: {content: 'bbb above\n{% foo %}\nbbb below', locals: {title: 'Bar'}, layout: 'ccc'},
      ccc: {content: 'ccc above\n{% foo %}\nccc below', locals: {title: 'Baz'}, layout: 'default'},
      ddd: {content: 'ddd above\n{% foo %}\nddd below', locals: {title: 'Baz'} }
    };
    var stack3 = {
      'default': {content: 'default above\n{{ body }}\ndefault below', locals: {title: 'Quux'}},
      aaa: {content: 'aaa above\n{{ body }}\naaa below', locals: {title: 'Foo'}, layout: 'bbb'},
      bbb: {content: 'bbb above\n{{ body }}\nbbb below', locals: {title: 'Bar'}, layout: 'ccc'},
      ccc: {content: 'ccc above\n{{ body }}\nccc below', locals: {title: 'Baz'}, layout: 'default'},
      ddd: {content: 'ddd above\n{{ body }}\nddd below', locals: {title: 'Baz'} }
    };
    var stack4 = {
      'default': {content: 'default above\n{{ foo }}\ndefault below', locals: {title: 'Quux'}},
      aaa: {content: 'aaa above\n{{ foo }}\naaa below', locals: {title: 'Foo'}, layout: 'bbb'},
      bbb: {content: 'bbb above\n{{ foo }}\nbbb below', locals: {title: 'Bar'}, layout: 'ccc'},
      ccc: {content: 'ccc above\n{{ foo }}\nccc below', locals: {title: 'Baz'}, layout: 'default'},
      ddd: {content: 'ddd above\n{{ foo }}\nddd below', locals: {title: 'Baz'} }
    };

    it('should use a custom tagname', function() {
      var file = {content: stack2.aaa.content, layout: 'bbb', path: 'foo'};
      assert.deepEqual(layouts(file, stack2, {tagname: 'foo'}).content, [
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

    it('should use custom delimiters defined as an array', function() {
      var file = {content: stack3.aaa.content, layout: 'bbb', path: 'foo'};
      assert.deepEqual(layouts(file, stack3, {layoutDelims: ['{{', '}}']}).content, [
        'default above',
        'ccc above',
        'bbb above',
        'aaa above',
        '{{ body }}',
        'aaa below',
        'bbb below',
        'ccc below',
        'default below'
      ].join('\n'));
    });

    it('should use custom delimiters defined as a string', function() {
      var file = {content: stack3.aaa.content, layout: 'bbb', path: 'foo'};
      assert.deepEqual(layouts(file, stack3, {layoutDelims: '{{([\\s\\S]+?)}}'}).content, [
        'default above',
        'ccc above',
        'bbb above',
        'aaa above',
        '{{ body }}',
        'aaa below',
        'bbb below',
        'ccc below',
        'default below'
      ].join('\n'));
    });

    it('should use custom delimiters defined as a regex', function() {
      var file = {content: stack3.aaa.content, layout: 'bbb', path: 'foo'};
      assert.deepEqual(layouts(file, stack3, {layoutDelims: /\{{([\s\S]+?)}}/}).content, [
        'default above',
        'ccc above',
        'bbb above',
        'aaa above',
        '{{ body }}',
        'aaa below',
        'bbb below',
        'ccc below',
        'default below'
      ].join('\n'));
    });

    it('should use default delimiters', function() {
      var obj = {abc: {content: '{%= body %}[[body]]{%body%}{% body %}<%body%>', path: 'abc'}};
      var file = {content: 'INNER', layout: 'abc', path: 'foo'};
      assert.deepEqual(layouts(file, obj).content, '{%= body %}[[body]]{%body%}INNER<%body%>');
    });

    it('should use custom delimiters', function() {
      var obj = {abc: {content: '{%= body %}[[body]]{%body%}{% body %}<% body %>'}};
      var file = {content: 'INNER', layout: 'abc', path: 'foo'};
      assert.deepEqual(layouts(file, obj, {layoutDelims: ['<%', '%>']}).content, '{%= body %}[[body]]{%body%}{% body %}INNER');
    });

    it('should use custom delimiters and tagname', function() {
      var file = {content: stack4.aaa.content, layout: 'bbb', path: 'foo'};
      assert.deepEqual(layouts(file, stack4, {tagname: 'foo', layoutDelims: ['{{', '}}']}).content, [
        'default above',
        'ccc above',
        'bbb above',
        'aaa above',
        '{{ foo }}',
        'aaa below',
        'bbb below',
        'ccc below',
        'default below'
      ].join('\n'));
    });
  });

  describe('layout delimiters', function() {
    it('should apply a layout to the given string.', function() {
      var obj = {blah: {content: 'blah above\n{% body %}\nblah below'}};
      var file = {content: 'This is content', layout: 'blah', path: 'foo'};
      assert.deepEqual(layouts(file, obj).content, [
        'blah above',
        'This is content',
        'blah below'
      ].join('\n'));
    });
  });
});
