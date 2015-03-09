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
var layouts = require('./');
var _ = require('lodash');

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

  describe('custom tokens', function () {
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

    it('should use custom delimiters', function () {
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

    it('should use default delimiters', function () {
      var obj = {abc: {content: '{%= body %}[[body]]{%body%}{% body %}<%body%>'}};
      layouts('INNER', 'abc', obj).result.should.eql('{%= body %}[[body]]{%body%}INNER<%body%>');
    });

    it('should use custom delimiters', function () {
      var obj = {abc: {content: '{%= body %}[[body]]{%body%}{% body %}<%body%>'}};
      layouts('INNER', 'abc', obj, {layoutDelims: ['<%', '%>']}).result.should.eql('{%= body %}[[body]]{%body%}{% body %}INNER');
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

    it('should return an object with the layout stack.', function () {
      var obj = {blah: {content: 'blah above\n{% body %}\nblah below'}};
      var actual = layouts('This is content', 'blah', obj);
      actual.should.have.properties(['stack', 'options', 'result']);
      actual.stack.should.be.an.array;
    });

    it('should push all layouts onto the stack:', function () {
      var scripts = [];
      var actual = layouts('This is content', 'aaa', stack, function (ele, res) {
        res.scripts = _.union([], res.scripts, ele.layout.data.scripts || []);
      });
      console.log(util.inspect(actual, null, 10))
    });
  });
});
