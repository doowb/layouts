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


describe('.data()', function () {
  layouts.setLayout('first', '{%= body %}', { layout: 'a' });
  layouts.setLayout('a', 'A above\n{%= body %}\nA below', { layout: 'b', xyz: 'aaa', one: 'two' });
  layouts.setLayout('b', 'B above\n{%= body %}\nB below', { layout: 'c', xyz: 'bbb', three: 'four' });
  layouts.setLayout('c', 'C above\n{%= body %}\nC below', { layout: 'd' });
  layouts.setLayout('d', 'D above\n{%= body %}\nD below', { layout: 'e' });
  layouts.setLayout('e', 'E above\n{%= body %}\nE below', { layout: 'f' });
  layouts.setLayout('f', 'F above\n{%= body %}\nF below', { layout: 'last' });
  layouts.setLayout('last', 'last!\n{%= body %}\nlast!', { xyz: 'zzz' });

  it('should return an extended data object from the flattened layouts.', function () {
    var actual = layouts.stack('first');
    var expected = [
      'last!',
      'F above',
      'E above',
      'D above',
      'C above',
      'B above',
      'A above',
      '{%= body %}', // should not be compiled
      'A below',
      'B below',
      'C below',
      'D below',
      'E below',
      'F below',
      'last!'
    ].join('\n');
    actual.content.should.eql(expected);
    actual.data.options.locals.should.eql({xyz: 'aaa', one: 'two', three: 'four'});
  });
});