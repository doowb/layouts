/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Layouts = require('..');


describe('.stack():', function () {
  describe('when layouts are defined as objects:', function () {
    var layouts = new Layouts();

    layouts.set({first: { layout: 'a', content: '{{body}}' }});
    layouts.set({a: { layout: 'b', a: 'b', content: 'A above\n{{body}}\nA below' }});
    layouts.set({b: { layout: 'c', c: 'd', content: 'B above\n{{body}}\nB below' }});
    layouts.set({c: { layout: 'd', e: 'f', content: 'C above\n{{body}}\nC below' }});
    layouts.set({d: { layout: 'e', g: 'h', content: 'D above\n{{body}}\nD below' }});
    layouts.set({e: { layout: 'f', i: 'j', content: 'E above\n{{body}}\nE below' }});
    layouts.set({f: { layout: 'last', data: {one: 'two'}, content: 'F above\n{{body}}\nF below' }});
    layouts.set({last: { layout: undefined, content: 'last!\n{{body}}\nlast!' }});

    it('should return a layout stack.', function () {
      var stack = layouts.stack('first');
      var expected = [
        'last!',
        'F above',
        'E above',
        'D above',
        'C above',
        'B above',
        'A above',
        '{{body}}',
        'A below',
        'B below',
        'C below',
        'D below',
        'E below',
        'F below',
        'last!'
      ].join('\n');
      stack.content.should.eql(expected);
    });

    it('should return a `data` object with.', function () {
      var stack = layouts.stack('first');
      stack.data.should.eql({
        a: 'b',
        c: 'd',
        e: 'f',
        g: 'h',
        i: 'j',
        one: 'two'
      });
    });
  });

  describe('when layouts are defined with string values:', function () {
    var layouts = new Layouts();

    layouts.set('first', 'a', '{{body}}');
    layouts.set('a', 'b', 'A above\n{{body}}\nA below');
    layouts.set('b', 'c', 'B above\n{{body}}\nB below');
    layouts.set('c', 'd', 'C above\n{{body}}\nC below');
    layouts.set('d', 'e', 'D above\n{{body}}\nD below');
    layouts.set('e', 'f', 'E above\n{{body}}\nE below');
    layouts.set('f', 'last', 'F above\n{{body}}\nF below');
    layouts.set('last', undefined, 'last!\n{{body}}\nlast!');

    it('should build a layout stack', function () {
      var actual = layouts.stack('first');
      var expected = [
        'last!',
        'F above',
        'E above',
        'D above',
        'C above',
        'B above',
        'A above',
        '{{body}}',
        'A below',
        'B below',
        'C below',
        'D below',
        'E below',
        'F below',
        'last!'
      ].join('\n');
      actual.content.should.eql(expected);
    });
  });
});