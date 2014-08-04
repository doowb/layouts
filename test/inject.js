/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Layouts = require('..');


describe('.inject():', function () {
  describe('when layouts are defined as objects:', function () {
    var layouts = new Layouts();

    layouts.set({a: { layout: 'b', content: 'A above\n{%body%}\nA below' }});
    layouts.set({b: { layout: 'c', content: 'B above\n{%body%}\nB below' }});
    layouts.set({c: { layout: 'd', content: 'C above\n{%body%}\nC below' }});
    layouts.set({d: { layout: 'e', content: 'D above\n{%body%}\nD below' }});
    layouts.set({last: { layout: undefined, content: 'last!\n{%body%}\nlast!' }});
    layouts.set({e: { layout: 'f', content: 'E above\n{%body%}\nE below' }});
    layouts.set({f: { layout: 'last', content: 'F above\n{%body%}\nF below' }});
    layouts.set({first: { layout: 'a', content: '{%body%}' }});

    it('should inject content into a layout.', function () {
      var stack = layouts.inject('fooo', 'first');
      var expected = [
        'last!',
        'F above',
        'E above',
        'D above',
        'C above',
        'B above',
        'A above',
        '{%body%}', // last {%body%} tag should be unprocessed
        'A below',
        'B below',
        'C below',
        'D below',
        'E below',
        'F below',
        'last!'
      ].join('\n');


    });
  });

  describe('when layouts are defined with string values:', function () {
    var layouts = new Layouts();

    layouts.set('first', 'a', '{%body%}');
    layouts.set('a', 'b', 'A above\n{%body%}\nA below');
    layouts.set('b', 'c', 'B above\n{%body%}\nB below');
    layouts.set('c', 'd', 'C above\n{%body%}\nC below');
    layouts.set('d', 'e', 'D above\n{%body%}\nD below');
    layouts.set('e', '', 'E above\n{%body%}\nE below');
    layouts.set('last', undefined, 'last!\n{%body%}\nlast!');

    it('should extend the `cache`.', function () {
      var actual = layouts.inject('Last! {%body%}', 'first');
      var expected = [
        'E above',
        'D above',
        'C above',
        'B above',
        'A above',
        'Last! {%body%}', // last {%body%} tag should be unprocessed
        'A below',
        'B below',
        'C below',
        'D below',
        'E below'
      ].join('\n');
      actual.content.should.eql(expected);
    });
  });
});