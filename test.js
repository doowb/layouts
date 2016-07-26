'use strict';

require('mocha');
var union = require('arr-union');
var toVinyl = require('to-vinyl');
var assert = require('assert');
var layouts = require('./');

describe('errors:', function() {
  it('should throw an error when invalid arguments are passed:', function(cb) {
    try {
      layouts();
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'expected file to be an object');
      cb();
    }
  });

  it('should throw an error when file.path is not a string', function(cb) {
    try {
      layouts({content: 'This is content'}, {});
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'expected file.path to be a string');
      cb();
    }
  });

  it('should throw an error when layout name is not defined', function(cb) {
    try {
      layouts({content: 'This is content', path: 'foo'}, {});
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'expected layout name to be a string or falsey, not undefined');
      cb();
    }
  });

  it('should throw an error when the template does not exist', function(cb) {
    try {
      layouts({content: 'This is content', layout: 'blah', path: 'foo'}, {blah: {content: 'foo'}});
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'cannot find tag "{% body %}" in "blah"');
      cb();
    }
  });
});

describe('when the body tag is not found:', function() {
  it('should throw an error with default delims:', function(cb) {
    try {
      var obj = {abc: {content: 'blah above\n{% foo %}\nblah below'}};
      var file = {content: 'This is content', layout: 'abc', path: 'foo'};
      layouts(file, obj);
      cb(new Error('expected an error'));
    } catch (err) {
      assert.equal(err.message, 'cannot find tag "{% body %}" in "abc"');
      cb();
    }
  });

  it('should throw an error when custom tag is not found:', function(cb) {
    try {
      var obj = {abc: {content: 'blah above\n{% bar %}\nblah below', path: 'abc'}};
      var file = {content: 'This is content', layout: 'abc', path: 'foo'};
      layouts(file, obj, {layoutDelims: ['{%', '%}']});
      cb(new Error('expected an error'));
      return;
    } catch (err) {
      assert.equal(err.message, 'cannot find tag "{% body %}" in "abc"');
    }

    try {
      obj = {abc: {content: 'blah above\n{%= bar %}\nblah below'}};
      var file = {content: 'This is content', layout: 'abc', path: 'foo'};
      layouts(file, obj, {layoutDelims: ['{%=', '%}']});
      cb(new Error('expected an error'));
      return;
    } catch (err) {
      assert.equal(err.message, 'cannot find tag "{%= body %}" in "abc"');
    }

    try {
      obj = {abc: {content: 'blah above\n{%- ody %}\nblah below'}};
      var file = {content: 'This is content', layout: 'abc', path: 'foo'};
      layouts(file, obj, {layoutDelims: ['{%-', '%}']});
      cb(new Error('expected an error'));
      return;
    } catch (err) {
      assert.equal(err.message, 'cannot find tag "{%- body %}" in "abc"');
    }

    try {
      obj = {abc: {content: 'blah above\n<% ody %>\nblah below'}};
      var file = {content: 'This is content', layout: 'abc', path: 'foo'};
      layouts(file, obj, {layoutDelims: ['<%', '%>']});
      cb(new Error('expected an error'));
      return;
    } catch (err) {
      assert.equal(err.message, 'cannot find tag "<% body %>" in "abc"');
    }

    try {
      obj = {abc: {content: 'blah above\n<%= ody %>\nblah below'}};
      var file = {content: 'This is content', layout: 'abc', path: 'foo'};
      layouts(file, obj, {layoutDelims: ['<%=', '%>']});
      cb(new Error('expected an error'));
      return;
    } catch (err) {
      assert.equal(err.message, 'cannot find tag "<%= body %>" in "abc"');
    }

    try {
      obj = {abc: {content: 'blah above\n<%- ody %>\nblah below'}};
      var file = {content: 'This is content', layout: 'abc', path: 'foo'};
      layouts(file, obj, {layoutDelims: ['<%-', '%>']});
      cb(new Error('expected an error'));
      return;
    } catch (err) {
      assert.equal(err.message, 'cannot find tag "<%- body %>" in "abc"');
    }
    cb();
  });

  describe('custom delimiters', function() {
    it('should throw an error when custom delims are an array:', function(cb) {
      try {
        var obj = {abc: {content: 'blah above\n{% ody %}\nblah below'}};
        var file = {content: 'This is content', layout: 'abc', path: 'foo'};
        layouts(file, obj, {layoutDelims: ['{{', '}}']});
        cb(new Error('expected an error'));
      } catch (err) {
        assert.equal(err.message, 'cannot find tag "{{ body }}" in "abc"');
        cb();
      }
    });

    it('should throw an error when tag is missing with custom regex', function(cb) {
      try {
        var obj = {abc: {content: 'blah above\n{{foo}}\nblah below'}};
        var file = {content: 'This is content', layout: 'abc', path: 'foo'};
        layouts(file, obj, {layoutDelims: /\{%([\s\S]+?)%}/g});
        cb(new Error('expected an error'));
      } catch (err) {
        assert.equal(err.message, 'cannot find tag "{% body %}" in "abc"');
        cb();
      }
    });

    it('should throw an error when custom delims are a string:', function(cb) {
      try {
        var obj = {abc: {content: 'blah above\n{% ody %}\nblah below'}};
        var file = {content: 'This is content', layout: 'abc', path: 'foo'};
        layouts(file, obj, {layoutDelims: '{{([\\s\\S]+?)}}'});
        cb(new Error('expected an error'));
      } catch (err) {
        assert.equal(err.message, 'cannot find tag "{{ body }}" in "abc"');
        cb();
      }
    });

    it('should throw an error when a layout is not applied.', function(cb) {
      try {
        var obj = {abc: {path: 'blah', content: 'blah above\n{% body %}\nblah below'}};
        var file = {content: 'This is content', layout: 'foobar', path: 'foo'};
        layouts(file, obj);
        cb(new Error('expected an error'));
      } catch (err) {
        assert.equal(err.message, 'could not find layout "foobar"');
        cb();
      }
    });
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

    it('should throw an error if layout is specified and not found', function(cb) {
      try {
        var obj = {abc: {path: 'blah', content: 'blah above\n{% body %}\nblah below'}};
        var file = {content: 'This is content', layout: 'ffo', path: 'foo'};
        layouts(file, obj, {defaultLayout: 'abc'});
        cb(new Error('expected an error'));
      } catch (err) {
        assert.equal(err.message, 'could not find layout "ffo"');
        cb();
      }
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
    it('should support multiple tags', function() {
      var obj = {abc: {content: 'blah above\n{% body %}\n{% body %}\nblah below'}};
      var file = {content: 'This is content', layout: 'abc', path: 'foo'};
      assert.deepEqual(layouts(file, obj).content, [
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
      var file = {content:'This is content', layout: 'blah', path: 'foo'};
      assert.deepEqual(layouts(file, obj).content, [
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

    it.skip('should return an object with the layout history.', function() {
      var obj = {blah: {content: 'blah above\n{% body %}\nblah below'}};
      var file = {content:'This is content', layout: 'blah', path: 'foo'};
      var actual = layouts(file, obj);
      assert(actual.hasOwnProperty('history'));
      assert(actual.hasOwnProperty('options'));
      assert(actual.hasOwnProperty('result'));
      assert(Array.isArray(actual.history));
    });

    it.skip('should push all layouts onto the stack:', function() {
      var file = {content: 'This is content', layout: 'aaa', path: 'foo'};
      var actual = layouts(file, stack, function(ele, res) {
        res.scripts = union([], res.scripts, ele.layout.data.scripts || []);
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
    var file = {contents: buffer, layout: 'abc', path: 'foo'};
    var actual = layouts(file, obj);

    assert.deepEqual(actual.content, [
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
