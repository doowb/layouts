/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Layouts = require('..');


describe('.render():', function () {
  describe('when layouts are defined as objects:', function () {
    var layouts = new Layouts();

    layouts.setLayout({last: { layout: undefined, content: 'last!\n{%= body %}\nlast!' }});
    layouts.setLayout({f: { layout: 'last', content: 'F above\n{%= body %}\nF below' }});
    layouts.setLayout({e: { layout: 'f', content: 'E above\n{%= body %}\nE below' }});
    layouts.setLayout({d: { layout: 'e', content: 'D above\n{%= body %}\nD below' }});
    layouts.setLayout({c: { layout: 'd', content: 'C above\n{%= body %}\nC below' }});
    layouts.setLayout({b: { layout: 'c', content: 'B above\n{%= body %}\nB below' }});
    layouts.setLayout({a: { layout: 'b', content: 'A above\n{%= body %}\nA below' }});
    layouts.setLayout({first: { layout: 'a', content: '{%= body %}' }});

    it('should render content into a layout.', function () {
      var actual = layouts.render('fooo', 'first');
      var expected = [
        'last!',
        'F above',
        'E above',
        'D above',
        'C above',
        'B above',
        'A above',
        'fooo', // last {%= body %} tag should be unrendered
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

  describe('when layouts are defined with string values:', function () {
    var layouts = new Layouts();

    layouts.setLayout('first', '{%= body %}', { layout: 'a' });
    layouts.setLayout('a', 'A above\n{%= body %}\nA below', { layout: 'b' });
    layouts.setLayout('b', 'B above\n{%= body %}\nB below', { layout: 'c' });
    layouts.setLayout('c', 'C above\n{%= body %}\nC below', { layout: 'd' });
    layouts.setLayout('d', 'D above\n{%= body %}\nD below', { layout: 'e' });
    layouts.setLayout('e', 'E above\n{%= body %}\nE below', { layout: '' });
    layouts.setLayout('last', 'last!\n{%= body %}\nlast!', { layout: undefined });

    it('should extend the `cache`.', function () {
      var actual = layouts.render('Last! {%= body %}', 'first');
      var expected = [
        'E above',
        'D above',
        'C above',
        'B above',
        'A above',
        'Last! {%= body %}', // last {%= body %} tag should be unrendered
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
