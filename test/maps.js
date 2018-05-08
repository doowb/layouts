'use strict';

require('mocha');
const assert = require('assert');
const layouts = require('..');

describe('maps', function() {
  beforeEach(() => layouts.clearCache());

  const fixtures = {
    multiple: {
      contents: Buffer.from('blah above\n{% body %}\n{% body %}\nblah below')
    },
    default: {
      contents: Buffer.from('default above\n{% body %}\ndefault below'),
      data: { scripts: ['main.js'] },
      locals: { title: 'Quux' }
    },
    aaa: {
      contents: Buffer.from('aaa above\n{% body %}\naaa below'),
      data: { scripts: ['aaa.js'] },
      locals: { title: 'Foo' },
      layout: 'bbb'
    },
    bbb: {
      contents: Buffer.from('bbb above\n{% body %}\nbbb below'),
      data: { scripts: ['bbb.js'] },
      locals: { title: 'Bar' },
      layout: 'ccc'
    },
    ccc: {
      contents: Buffer.from('ccc above\n{% body %}\nccc below'),
      data: { scripts: ['ccc.js'] },
      locals: { title: 'Baz' },
      layout: 'default'
    },
    ddd: {
      contents: Buffer.from('ddd above\n{% body %}\nddd below'),
      data: { scripts: ['ddd.js'] },
      locals: { title: 'Baz' }
    }
  };

  const stack = new Map();
  for (const key of Object.keys(fixtures)) {
    stack.set(key, fixtures[key]);
  }

  it('should apply a layout to the given string.', function() {
    const obj = { abc: { contents: Buffer.from('blah above\n{% body %}\nblah below') } };
    const file = { contents: Buffer.from('This is content'), layout: 'abc', path: 'foo' };
    assert.deepEqual(layouts(file, obj).contents.toString(), 'blah above\nThis is content\nblah below');
  });

  it('should not apply a layout to itself', function() {
    const layoutCollection = {
      default: { contents: Buffer.from('default above\n{% body %}\ndefault below'), layout: 'default' }
    };
    const file = { contents: Buffer.from('This is content'), layout: 'default', path: 'foo' };
    const actual = layouts(file, layoutCollection);
    assert.deepEqual(actual.contents.toString(), 'default above\nThis is content\ndefault below');
  });

  it('should apply cyclical layouts exactly once', function() {
    const layoutCollection = {
      default: { contents: Buffer.from('default above\n{% body %}\ndefault below'), layout: 'other' },
      other: { contents: Buffer.from('other above\n{% body %}\nother below'), layout: 'default' },
    };
    const file = { contents: Buffer.from('This is content'), layout: 'default', path: 'foo' };
    const actual = layouts(file, layoutCollection);
    assert.deepEqual(actual.contents.toString(), 'other above\ndefault above\nThis is content\ndefault below\nother below');
  });

  describe('when a defaultLayout is defined', function() {
    it('should not apply a layout if the name is an empty string:', function() {
      const obj = { abc: { contents: Buffer.from('blah above\n{% body %}\nblah below') } };
      const file = { contents: Buffer.from('This is content'), layout: '', path: 'foo' };
      assert.deepEqual(layouts(file, obj, {defaultLayout: 'abc'}).contents.toString(), [
        'This is content'
      ].join('\n'));
    });

    it('should throw an error if layout is specified and not found', function() {
      assert.throws(function() {
        const obj = { abc: { path: 'blah', contents: Buffer.from('blah above\n{% body %}\nblah below') } };
        const file = { contents: Buffer.from('This is content'), layout: 'ffo', path: 'foo' };
        layouts(file, obj, { defaultLayout: 'abc' });
      }, /layout "ffo" is defined on "foo" but cannot be found/);
    });
  });

  it('should not apply a layout when the layout name is falsey', function() {
    const obj = { abc: { contents: Buffer.from('blah above\n{% body %}\nblah below') } };
    function createFile(name) {
      return { contents: Buffer.from('This is content'), layout: name, path: 'foo' };
    }
    assert.deepEqual(layouts(createFile('none'), obj).contents.toString(), 'This is content');
    assert.deepEqual(layouts(createFile(null), obj).contents.toString(), 'This is content');
    assert.deepEqual(layouts(createFile('null'), obj).contents.toString(), 'This is content');
    assert.deepEqual(layouts(createFile(false), obj).contents.toString(), 'This is content');
    assert.deepEqual(layouts(createFile('false'), obj).contents.toString(), 'This is content');
    assert.deepEqual(layouts(createFile('nil'), obj).contents.toString(), 'This is content');
  });

  describe('apply layouts.', function() {
    it('should support multiple body tags', function() {
      const file = {
        contents: Buffer.from('This is content'),
        layout: 'multiple',
        path: 'foo'
      };

      assert.deepEqual(layouts(file, stack).contents.toString(), [
        'blah above',
        'This is content',
        'This is content',
        'blah below'
      ].join('\n'));
    });

    it('should trim whitespace', function() {
      const file = {
        contents: Buffer.from('   This is content   '),
        layout: 'multiple',
        path: 'foo'
      };

      assert.deepEqual(layouts(file, stack, { trim: true }).contents.toString(), [
        'blah above',
        'This is content',
        'This is content',
        'blah below'
      ].join('\n'));
    });

    it('should replace the `{%= body %}` tag with content.', function() {
      const file = {contents: Buffer.from('This is content'), layout: 'aaa', path: 'foo'};
      assert.deepEqual(layouts(file, stack).contents.toString(), [
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
      const file = { contents: stack.get('aaa').contents, layout: 'bbb', path: 'foo' };
      assert.deepEqual(layouts(file, stack).contents.toString(), [
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
    const stack2 = {
      'default': {contents: Buffer.from('default above\n{% foo %}\ndefault below'), locals: {title: 'Quux'}},
      aaa: {contents: Buffer.from('aaa above\n{% foo %}\naaa below'), locals: {title: 'Foo'}, layout: 'bbb'},
      bbb: {contents: Buffer.from('bbb above\n{% foo %}\nbbb below'), locals: {title: 'Bar'}, layout: 'ccc'},
      ccc: {contents: Buffer.from('ccc above\n{% foo %}\nccc below'), locals: {title: 'Baz'}, layout: 'default'},
      ddd: {contents: Buffer.from('ddd above\n{% foo %}\nddd below'), locals: {title: 'Baz'} }
    };
    const stack3 = {
      'default': {contents: Buffer.from('default above\n{{ body }}\ndefault below'), locals: {title: 'Quux'}},
      aaa: {contents: Buffer.from('aaa above\n{{ body }}\naaa below'), locals: {title: 'Foo'}, layout: 'bbb'},
      bbb: {contents: Buffer.from('bbb above\n{{ body }}\nbbb below'), locals: {title: 'Bar'}, layout: 'ccc'},
      ccc: {contents: Buffer.from('ccc above\n{{ body }}\nccc below'), locals: {title: 'Baz'}, layout: 'default'},
      ddd: {contents: Buffer.from('ddd above\n{{ body }}\nddd below'), locals: {title: 'Baz'} }
    };
    const stack4 = {
      'default': {contents: Buffer.from('default above\n{{ foo }}\ndefault below'), locals: {title: 'Quux'}},
      aaa: {contents: Buffer.from('aaa above\n{{ foo }}\naaa below'), locals: {title: 'Foo'}, layout: 'bbb'},
      bbb: {contents: Buffer.from('bbb above\n{{ foo }}\nbbb below'), locals: {title: 'Bar'}, layout: 'ccc'},
      ccc: {contents: Buffer.from('ccc above\n{{ foo }}\nccc below'), locals: {title: 'Baz'}, layout: 'default'},
      ddd: {contents: Buffer.from('ddd above\n{{ foo }}\nddd below'), locals: {title: 'Baz'} }
    };

    it('should use a custom tagname', function() {
      const file = {contents: stack2.aaa.contents, layout: 'bbb', path: 'foo'};
      assert.deepEqual(layouts(file, stack2, {tagname: 'foo'}).contents.toString(), [
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

    it('should throw an error when custom delimiters are invalid', function() {
      const file = {contents: stack3.aaa.contents, layout: 'bbb', path: 'foo'};
      assert.throws(() => {
        layouts(file, stack3, {layoutDelims: function() {}});
      }, /expected options\.layoutDelims/);
    });

    it('should use custom delimiters defined as an array', function() {
      const file = {contents: stack3.aaa.contents, layout: 'bbb', path: 'foo'};
      assert.deepEqual(layouts(file, stack3, {layoutDelims: ['{{', '}}']}).contents.toString(), [
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
      const file = {contents: stack3.aaa.contents, layout: 'bbb', path: 'foo'};
      assert.deepEqual(layouts(file, stack3, {layoutDelims: '{{([\\s\\S]+?)}}'}).contents.toString(), [
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
      const file = {contents: stack3.aaa.contents, layout: 'bbb', path: 'foo'};
      assert.deepEqual(layouts(file, stack3, {layoutDelims: /{{([\s\S]+?)}}/}).contents.toString(), [
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
      const obj = { abc: { contents: Buffer.from('{%= body %}[[body]]{%body%}{% body %}<%body%>'), path: 'abc' } };
      const file = { contents: Buffer.from('INNER'), layout: 'abc', path: 'foo' };
      assert.deepEqual(layouts(file, obj).contents.toString(), '{%= body %}[[body]]{%body%}INNER<%body%>');
    });

    it('should use custom delimiters', function() {
      const obj = { abc: { contents: Buffer.from('{%= body %}[[body]]{%body%}{% body %}<% body %>') } };
      const file = { contents: Buffer.from('INNER'), layout: 'abc', path: 'foo' };
      const opts = { layoutDelims: ['<%', '%>'] };
      assert.deepEqual(layouts(file, obj, opts).contents.toString(), '{%= body %}[[body]]{%body%}{% body %}INNER');
    });

    it('should use custom delimiters and tagname', function() {
      const file = {contents: stack4.aaa.contents, layout: 'bbb', path: 'foo'};
      const opts = {tagname: 'foo', layoutDelims: ['{{', '}}']};
      assert.deepEqual(layouts(file, stack4, opts).contents.toString(), [
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
      const obj = {blah: {contents: Buffer.from('blah above\n{% body %}\nblah below') }};
      const file = {contents: Buffer.from('This is content'), layout: 'blah', path: 'foo'};
      assert.deepEqual(layouts(file, obj).contents.toString(), [
        'blah above',
        'This is content',
        'blah below'
      ].join('\n'));
    });
  });
});
