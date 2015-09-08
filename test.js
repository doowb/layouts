/*!
 * layouts <https://github.com/doowb/layouts>
 *
 * Copyright (c) 2014-2015, Brian Woodward.
 * Licensed under the MIT License.
 */

'use strict';

/* deps:mocha */
var util = require('util');
var should = require('should');
var toVinyl = require('to-vinyl');
var layouts = require('./');
var _ = require('lodash');

describe('errors:', function () {
  it('should throw an error when invalid arguments are passed:', function () {
    (function () {
      layouts();
    }).should.throw('layouts expects a string.');
  });
});

describe('.layouts():', function () {
  var stack = {
    'default': {
      content: 'default above\n{% body %}\ndefault below',
      data: {scripts: ['main.js']},
      locals: {title: 'Quux'},
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

  it('should apply a layout to the given string.', function () {
    var obj = {abc: {content: 'blah above\n{% body %}\nblah below'}};
    layouts('This is content', 'abc', obj).result.should.eql([
      'blah above',
      'This is content',
      'blah below'
    ].join('\n'));
  });

  describe('apply layouts.', function () {
    it('should wrap a string with a layout.', function () {
      var obj = {abc: {content: 'blah above\n{% body %}\n{% body %}\nblah below'}};
      layouts('This is content', 'abc', obj).result.should.eql([
        'blah above',
        'This is content',
        'This is content',
        'blah below'
      ].join('\n'));
    });

    it('should replace the `{%= body %}` tag with content.', function () {
      layouts('This is content', 'aaa', stack).result.should.eql([
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

    it('should not replace the `{%= body %}` tag when no content is passed.', function () {
      layouts(stack.aaa.content, 'bbb', stack).result.should.eql([
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

  describe('custom placeholders', function () {
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

    it('should use a custom tag', function () {
      layouts(stack2.aaa.content, 'bbb', stack2, {tag: 'foo'}).result.should.eql([
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

    it('should use custom delimiters defined as an array', function () {
      layouts(stack3.aaa.content, 'bbb', stack3, {layoutDelims: ['{{', '}}']}).result.should.eql([
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

    it('should use custom delimiters defined as a string', function () {
      layouts(stack3.aaa.content, 'bbb', stack3, {layoutDelims: '{{([\\s\\S]+?)}}'}).result.should.eql([
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

    it('should use custom delimiters defined as a regex', function () {
      layouts(stack3.aaa.content, 'bbb', stack3, {layoutDelims: /\{{([\s\S]+?)}}/}).result.should.eql([
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

    it('should use default delimiters', function () {
      var obj = {abc: {content: '{%= body %}[[body]]{%body%}{% body %}<%body%>'}};
      layouts('INNER', 'abc', obj).result.should.eql('{%= body %}[[body]]{%body%}INNER<%body%>');
    });

    it('should use custom delimiters', function () {
      var obj = {abc: {content: '{%= body %}[[body]]{%body%}{% body %}<%body%>'}};
      layouts('INNER', 'abc', obj, {layoutDelims: ['<%', '%>']}).result.should.eql('{%= body %}[[body]]{%body%}{% body %}INNER');
    });

    it('should use custom delimiters and tag', function () {
      layouts(stack4.aaa.content, 'bbb', stack4, {tag: 'foo', layoutDelims: ['{{', '}}']}).result.should.eql([
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
      layouts('This is content', 'blah', obj).result.should.eql([
        'blah above',
        'This is content',
        'blah below'
      ].join('\n'));
    });

    it('should throw an error when the tag is not defined.', function () {
      var obj = {blah: {content: 'foo'}};
      (function() {
        layouts('This is content', 'blah', obj)
      }).should.throw('cannot find layout tag "body" in "blah"');
    });
  });


  describe('stack', function () {
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

    it('should return an object with the layout history.', function () {
      var obj = {blah: {content: 'blah above\n{% body %}\nblah below'}};
      var actual = layouts('This is content', 'blah', obj);
      actual.should.have.properties(['history', 'options', 'result']);
      actual.history.should.be.an.array;
    });

    it('should push all layouts onto the stack:', function () {
      var scripts = [];
      var actual = layouts('This is content', 'aaa', stack, function (ele, res) {
        res.scripts = _.union([], res.scripts, ele.layout.data.scripts || []);
      });
    });
  });
});


describe('buffers:', function () {
  it('should support buffers.', function () {
    var obj = {
      abc: {content: new Buffer('blah above\n{% body %}\nblah below')}
    };

    var buffer = new Buffer('This is content');
    var actual = layouts(buffer, 'abc', obj);

    actual.result.should.eql([
      'blah above',
      'This is content',
      'blah below'
    ].join('\n'));
  });
});

describe('gulp / vinyl:', function () {
  var stack = {
    'default': {
      path: 'default.html',
      content: 'default above\n{% body %}\ndefault below',
      locals: {title: 'Quux'},
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

  it('should replace the `{%= body %}` tag with content.', function () {
    layouts('This is content', 'aaa', vinylize(stack)).result.should.eql([
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
