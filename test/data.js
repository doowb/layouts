/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

var should = require('should');
var _ = require('lodash');
var Layouts = require('..');
var layouts = new Layouts();


describe('layouts data', function () {
  layouts.set('a', {layout: 'b', xyz: 'aaa', one: 'two'}, 'A above\n{{body}}\nA below');
  layouts.set('b', {layout: 'c', xyz: 'bbb', three: 'four'}, 'B above\n{{body}}\nB below');
  layouts.set('c', 'd', 'C above\n{{body}}\nC below');
  layouts.set('d', 'e', 'D above\n{{body}}\nD below');
  layouts.set('base', {xyz: 'zzz'}, 'base!\n{{body}}\nbase!');
  layouts.set('e', 'f', 'E above\n{{body}}\nE below');
  layouts.set('f', 'base', 'F above\n{{body}}\nF below');
  layouts.set('foo', 'a', 'I\'m a <%= title %>');

  it('should return an extended data object from the flattened layouts.', function () {
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
    actual.data.should.eql({xyz: 'aaa', one: 'two', three: 'four'});
  });
});