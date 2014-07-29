/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

var should = require('should');
var Layouts = require('..');
var layouts = new Layouts();


describe('.set():', function () {
  describe('when layouts are defined as objects:', function () {
    layouts.set({a: { layout: 'b', content: 'A above\n{{body}}\nA below' }});
    layouts.set({b: { layout: 'c', content: 'B above\n{{body}}\nB below' }});
    layouts.set({c: { layout: 'd', content: 'C above\n{{body}}\nC below' }});
    layouts.set({d: { layout: 'e', content: 'D above\n{{body}}\nD below' }});
    layouts.set({base: { layout: undefined, content: 'base!\n{{body}}\nbase!' }});
    layouts.set({e: { layout: 'f', content: 'E above\n{{body}}\nE below' }});
    layouts.set({f: { layout: 'base', content: 'F above\n{{body}}\nF below' }});
    layouts.set({foo: { layout: 'a', content: 'I\'m a <%= title %>' }});

    it('should extend the `cache`.', function () {
      var actual = layouts.stack('foo');
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

  describe('when layouts are defined with string values:', function () {
    layouts.set('a', 'b', 'A above\n{{body}}\nA below');
    layouts.set('b', 'c', 'B above\n{{body}}\nB below');
    layouts.set('c', 'd', 'C above\n{{body}}\nC below');
    layouts.set('d', 'e', 'D above\n{{body}}\nD below');
    layouts.set('base', undefined, 'base!\n{{body}}\nbase!');
    layouts.set('e', 'f', 'E above\n{{body}}\nE below');
    layouts.set('f', 'base', 'F above\n{{body}}\nF below');
    layouts.set('foo', 'a', 'I\'m a <%= title %>');

    it('should extend the `cache`.', function () {
      var actual = layouts.stack('foo');
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