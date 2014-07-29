/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

var should = require('should');
var _ = require('lodash');
var Layouts = require('..');


describe('layouts options', function () {
  describe('options.extend', function () {
    describe('when NO custom `extend` function is passed', function () {
      var layouts = new Layouts();
      layouts.set('a', {layout: 'b', xyz: 'aaa', one: 'two'}, 'A above\n{{body}}\nA below');
      layouts.set('b', {layout: 'base', xyz: 'bbb', three: 'four'}, 'B above\n{{body}}\nB below');
      layouts.set('base', {xyz: 'zzz'}, 'base!\n{{body}}\nbase!');
      layouts.set('foo', 'a', 'I\'m a <%= title %>');

      it('should merge the context so that the inner-most templates context wins.', function () {
        var actual = layouts.stack('foo');
        var expected = [
          'base!',
          'B above',
          'A above',
          'I\'m a <%= title %>',
          'A below',
          'B below',
          'base!'
        ].join('\n');
        actual.content.should.eql(expected);
        actual.data.should.eql({xyz: 'aaa', one: 'two', three: 'four'});
      });
    });

    describe('when a custom `extend` function is passed', function () {
      var layouts = new Layouts({extend: _.defaults});
      layouts.set('a', {layout: 'b', xyz: 'aaa', one: 'two'}, 'A above\n{{body}}\nA below');
      layouts.set('b', {layout: 'base', xyz: 'bbb', three: 'four'}, 'B above\n{{body}}\nB below');
      layouts.set('base', {xyz: 'zzz'}, 'base!\n{{body}}\nbase!');
      layouts.set('foo', 'a', 'I\'m a <%= title %>');

      it('should change the order in which the context is merged.', function () {
        var actual = layouts.stack('foo');
        var expected = [
          'base!',
          'B above',
          'A above',
          'I\'m a <%= title %>',
          'A below',
          'B below',
          'base!'
        ].join('\n');
        actual.content.should.eql(expected);
        actual.data.should.eql({xyz: 'zzz', one: 'two', three: 'four'});
      });
    });
  });
});