/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Layouts = require('..');

var layouts = new Layouts({
  cache: {
    a: { layout: 'b', content: 'A above\n{{body}}\nA below' },
    b: { layout: 'c', content: 'B above\n{{body}}\nB below' },
    c: { layout: 'd', content: 'C above\n{{body}}\nC below' },
    d: { layout: 'e', content: 'D above\n{{body}}\nD below' },
    base: { layout: undefined, content: 'base!\n{{body}}\nbase!' },
    e: { layout: 'f', content: 'E above\n{{body}}\nE below' },
    f: { layout: 'base', content: 'F above\n{{body}}\nF below' },
    foo: { layout: 'a', content: 'I\'m a <%= title %>' },
    simple: { layout: 'base', content: 'I\'m a simple page.' },
  }
});

describe('layouts cache', function () {
  describe('.cache()', function () {

    it('should recursively inject content from each file into its layout.', function () {
      // Define the name of the cached template to start with
      var actual = layouts.wrap('simple');
      var expected = [
        'base!',
        'I\'m a simple page.',
        'base!'
      ].join('\n');
      actual.content.should.eql(expected);
    });

    it('should extend the `cache`.', function () {
      var actual = layouts.wrap('foo');
      var expected = [
        'base!',
        'F above',
        'E above',
        'D above',
        'C above',
        'B above',
        'A above',
        'I\'m a <%= title %>', // should not be compiled
        'A below',
        'B below',
        'C below',
        'D below',
        'E below',
        'F below',
        'base!'
      ].join('\n');

      actual.content.should.eql(expected);
    });
  });
});