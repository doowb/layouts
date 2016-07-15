/*!
 * layouts <https://github.com/doowb/layouts>
 *
 * Copyright (c) 2014-2015, Brian Woodward.
 * Licensed under the MIT License.
 */
'use strict';

/* deps:mocha */
var toVinyl = require('to-vinyl');
var assert = require('assert');
var layouts = require('./');
var _ = require('lodash');

describe('errors:', function() {
  it('should throw an error when invalid arguments are passed:', function(cb) {
    try {
      layouts();
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'expected content to be a string.');
      cb();
    }
  });

  it('should apply a layout to the given string.', function(cb) {
    try {
      layouts('This is content', {});
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'expected layout name to be a string.');
      cb();
    }
  });

  it('should throw an error when the tag is not defined.', function(cb) {
    var obj = {blah: {content: 'foo'}};
    try {
      layouts('This is content', 'blah', obj);
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'cannot find "{% body %}" in "blah"');
      cb();
    }
  });
});

describe('when the body tag is not found:', function() {
  it('should throw an error with default delims:', function(cb) {
    try {
      var obj = {abc: {content: 'blah above\n{% ody %}\nblah below'}};
      layouts('This is content', 'abc', obj);
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'cannot find "{% body %}" in "abc"');
      cb();
    }
  });

  it('should throw an error when custom delims are an array:', function(cb) {
    try {
      var obj = {abc: {content: 'blah above\n{% ody %}\nblah below'}};
      layouts('This is content', 'abc', obj, {layoutDelims: ['{%', '%}']});
      cb(new Error('expected an error'));
      return;
    } catch (err) {
      assert.equal(err.message, 'cannot find "{% body %}" in "abc"');
    }

    try {
      var obj = {abc: {content: 'blah above\n{%= ody %}\nblah below'}};
      layouts('This is content', 'abc', obj, {layoutDelims: ['{%=', '%}']});
      cb(new Error('expected an error'));
      return;
    } catch (err) {
      assert.equal(err.message, 'cannot find "{%= body %}" in "abc"');
    }

    try {
      var obj = {abc: {content: 'blah above\n{%- ody %}\nblah below'}};
      layouts('This is content', 'abc', obj, {layoutDelims: ['{%-', '%}']});
      cb(new Error('expected an error'));
      return;
    } catch (err) {
      assert.equal(err.message, 'cannot find "{%- body %}" in "abc"');
    }

    try {
      var obj = {abc: {content: 'blah above\n<% ody %>\nblah below'}};
      layouts('This is content', 'abc', obj, {layoutDelims: ['<%', '%>']});
      cb(new Error('expected an error'));
      return;
    } catch (err) {
      assert.equal(err.message, 'cannot find "<% body %>" in "abc"');
    }

    try {
      var obj = {abc: {content: 'blah above\n<%= ody %>\nblah below'}};
      layouts('This is content', 'abc', obj, {layoutDelims: ['<%=', '%>']});
      cb(new Error('expected an error'));
      return;
    } catch (err) {
      assert.equal(err.message, 'cannot find "<%= body %>" in "abc"');
    }

    try {
      var obj = {abc: {content: 'blah above\n<%- ody %>\nblah below'}};
      layouts('This is content', 'abc', obj, {layoutDelims: ['<%-', '%>']});
      cb(new Error('expected an error'));
      return;
    } catch (err) {
      assert.equal(err.message, 'cannot find "<%- body %>" in "abc"');
    }
    cb();
  });

  it('should throw an error when custom delims are a regex:', function(cb) {
    try {
      var obj = {abc: {content: 'blah above\n{% ody %}\nblah below'}};
      layouts('This is content', 'abc', obj, {layoutDelims: /\{%([\s\S]+?)%}/g});
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'cannot find "{% body %}" in "abc"');
      cb();
    }
  });

  it('should throw an error when custom delims are a string:', function(cb) {
    try {
      var obj = {abc: {content: 'blah above\n{% ody %}\nblah below'}};
      layouts('This is content', 'abc', obj, {layoutDelims: '{{([\\s\\S]+?)}}'});
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'cannot find "{{ body }}" in "abc"');
      cb();
    }
  });

  it('should throw an error when custom delims are an array:', function(cb) {
    try {
      var obj = {abc: {content: 'blah above\n{% ody %}\nblah below'}};
      layouts('This is content', 'abc', obj, {layoutDelims: ['{{', '}}']});
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'cannot find "{{ body }}" in "abc"');
      cb();
    }
  });

  it('should throw an error when a layout is not applied.', function(cb) {
    try {
      var obj = {abc: {path: 'blah', content: 'blah above\n{% body %}\nblah below'}};
      layouts('This is content', 'foobar', obj);
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'could not find layout "foobar"');
      cb();
    }
  });
});

describe('.layouts():', function() {
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

  it('should apply a layout to the given string.', function() {
    var obj = {abc: {content: 'blah above\n{% body %}\nblah below'}};
    assert.deepEqual(layouts('This is content', 'abc', obj).result, [
      'blah above',
      'This is content',
      'blah below'
    ].join('\n'));
  });

  describe('when a defaultLayout is defined', function() {
    it('should apply the default layout if the name is an empty string:', function() {
      var obj = {abc: {content: 'blah above\n{% body %}\nblah below'}};
      assert.deepEqual(layouts('This is content', '', obj, {defaultLayout: 'abc'}).result, [
        'blah above',
        'This is content',
        'blah below'
      ].join('\n'));
    });

    it('should still throw an error if layout is specified and not found', function(cb) {
      try {
        var obj = {abc: {path: 'blah', content: 'blah above\n{% body %}\nblah below'}};
        layouts('This is content', 'ffo', obj, {defaultLayout: 'abc'});
        cb(new Error('expected an error'));
      } catch (err) {
        assert.equal(err.message, 'could not find layout "ffo"');
        cb();
      }
    });
  });

  it('should not apply a layout when the layout name is falsey', function() {
    var obj = {abc: {content: 'blah above\n{% body %}\nblah below'}};
    assert.deepEqual(layouts('This is content', 'false', obj).result, [
      'This is content'
    ].join('\n'));

    assert.deepEqual(layouts('This is content', 'nil', obj).result, [
      'This is content'
    ].join('\n'));
  });

  describe('apply layouts.', function() {
    it('should wrap a string with a layout.', function() {
      var obj = {abc: {content: 'blah above\n{% body %}\n{% body %}\nblah below'}};
      assert.deepEqual(layouts('This is content', 'abc', obj).result, [
        'blah above',
        'This is content',
        'This is content',
        'blah below'
      ].join('\n'));
    });

    it('should replace the `{%= body %}` tag with content.', function() {
      assert.deepEqual(layouts('This is content', 'aaa', stack).result, [
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
      assert.deepEqual(layouts(stack.aaa.content, 'bbb', stack).result, [
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

    it('should use a custom contentTag', function() {
      assert.deepEqual(layouts(stack2.aaa.content, 'bbb', stack2, {contentTag: 'foo'}).result, [
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
      assert.deepEqual(layouts(stack3.aaa.content, 'bbb', stack3, {layoutDelims: ['{{', '}}']}).result, [
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
      assert.deepEqual(layouts(stack3.aaa.content, 'bbb', stack3, {layoutDelims: '{{([\\s\\S]+?)}}'}).result, [
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
      assert.deepEqual(layouts(stack3.aaa.content, 'bbb', stack3, {layoutDelims: /\{{([\s\S]+?)}}/}).result, [
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
      var obj = {abc: {content: '{%= body %}[[body]]{%body%}{% body %}<%body%>'}};
      assert.deepEqual(layouts('INNER', 'abc', obj).result, '{%= body %}[[body]]{%body%}INNER<%body%>');
    });

    it('should use custom delimiters', function() {
      var obj = {abc: {content: '{%= body %}[[body]]{%body%}{% body %}<%body%>'}};
      assert.deepEqual(layouts('INNER', 'abc', obj, {layoutDelims: ['<%', '%>']}).result, '{%= body %}[[body]]{%body%}{% body %}INNER');
    });

    it('should use custom delimiters and contentTag', function() {
      assert.deepEqual(layouts(stack4.aaa.content, 'bbb', stack4, {contentTag: 'foo', layoutDelims: ['{{', '}}']}).result, [
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
      assert.deepEqual(layouts('This is content', 'blah', obj).result, [
        'blah above',
        'This is content',
        'blah below'
      ].join('\n'));
    });
  });

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
      var actual = layouts('This is content', 'blah', obj);
      assert(actual.hasOwnProperty('history'));
      assert(actual.hasOwnProperty('options'));
      assert(actual.hasOwnProperty('result'));
      assert(Array.isArray(actual.history));
    });

    it('should push all layouts onto the stack:', function() {
      var actual = layouts('This is content', 'aaa', stack, function(ele, res) {
        res.scripts = _.union([], res.scripts, ele.layout.data.scripts || []);
      });
      assert(actual.hasOwnProperty('scripts'));
      assert.deepEqual(actual.scripts, ['aaa.js', 'bbb.js', 'ccc.js', 'index.js']);
    });
  });
});

describe('buffers:', function() {
  it('should support buffers.', function() {
    var obj = {
      abc: {content: new Buffer('blah above\n{% body %}\nblah below')}
    };

    var buffer = new Buffer('This is content');
    var actual = layouts(buffer, 'abc', obj);

    assert.deepEqual(actual.result, [
      'blah above',
      'This is content',
      'blah below'
    ].join('\n'));
  });
});

describe('gulp / vinyl:', function() {
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

  it('should replace the `{%= body %}` tag with content.', function() {
    assert.deepEqual(layouts('This is content', 'aaa', vinylize(stack)).result, [
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
