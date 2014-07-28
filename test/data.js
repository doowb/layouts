/*!
 * nested layouts
 *
 * Copyright (c) 2014 nested layouts, contributors
 * Licensed under the MIT License (MIT)
 */

var should = require('should');
var Layouts = require('..');
var layouts = new Layouts();


describe('layouts data', function () {
  layouts.set('a', 'b', 'A above\n{{body}}\nA below');
  layouts.set('b', 'c', 'B above\n{{body}}\nB below');
  layouts.set('c', 'd', 'C above\n{{body}}\nC below');
  layouts.set('d', 'e', 'D above\n{{body}}\nD below');
  layouts.set('base', undefined, 'base!\n{{body}}\nbase!');
  layouts.set('e', 'f', 'E above\n{{body}}\nE below');
  layouts.set('f', 'base', 'F above\n{{body}}\nF below');
  layouts.set('foo', 'a', 'I\'m a <%= title %>');

  it('should return an extended data object from the flattened layouts.', function () {
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
    actual.should.eql(expected);
  });
});