/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var _ = require('lodash');
var Layouts = require('..');


describe('layouts options', function () {
  describe('when NO custom `mergeFn` function is passed', function () {
    var layouts = new Layouts();
    layouts.setLayout('first', 'a', '{%= body %}');
    layouts.setLayout('a', {layout: 'b', xyz: 'aaa', one: 'two'}, 'A above\n{%= body %}\nA below');
    layouts.setLayout('b', {layout: 'last', xyz: 'bbb', three: 'four'}, 'B above\n{%= body %}\nB below');
    layouts.setLayout('last', {xyz: 'zzz'}, 'last!\n{%= body %}\nlast!');

    it('should merge the context so that the inner-most templates context wins.', function () {
      var actual = layouts.stack('first');
      var expected = [
        'last!',
        'B above',
        'A above',
        '{%= body %}',
        'A below',
        'B below',
        'last!'
      ].join('\n');

      actual.content.should.eql(expected);
      actual.data.options.locals.should.have.property('xyz', 'aaa');
      actual.data.options.locals.should.have.property('one', 'two');
    });
  });

  describe('when a custom `mergeFn` function is passed', function () {
    var layouts = new Layouts({mergeFn: _.defaults});
    layouts.setLayout('a', {layout: 'b', xyz: 'aaa', one: 'two'}, 'A above\n{%= body %}\nA below');
    layouts.setLayout('b', {layout: 'last', xyz: 'bbb', three: 'four'}, 'B above\n{%= body %}\nB below');
    layouts.setLayout('last', {xyz: 'zzz'}, 'last!\n{%= body %}\nlast!');
    layouts.setLayout('first', 'a', '{%= body %}');

    it('should change the order in which the context is merged.', function () {
      var actual = layouts.stack('first');
      var expected = [
        'last!',
        'B above',
        'A above',
        '{%= body %}',
        'A below',
        'B below',
        'last!'
      ].join('\n');

      actual.content.should.eql(expected);
      actual.data.options.locals.should.have.property('xyz', 'aaa');
      actual.data.options.locals.should.have.property('one', 'two');
    });
  });
});