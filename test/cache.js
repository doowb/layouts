/*!
 * nested layouts
 *
 * Copyright (c) 2014 nested layouts, contributors
 * Licensed under the MIT License (MIT)
 */

var should = require('should');
var Layouts = require('..');

var layouts = new Layouts({
  a: { layout: 'b', content: 'A above\n{{body}}\nA below' },
  b: { layout: 'c', content: 'B above\n{{body}}\nB below' },
  c: { layout: 'd', content: 'C above\n{{body}}\nC below' },
  d: { layout: 'e', content: 'D above\n{{body}}\nD below' },
  base: { layout: undefined, content: 'base!\n{{body}}\nbase!' },
  e: { layout: 'f', content: 'E above\n{{body}}\nE below' },
  f: { layout: 'base', content: 'F above\n{{body}}\nF below' },
  page: { layout: 'a', content: 'I\'m a <%= title %>' }
});

it('should extend the `cache`.', function () {

  var actual = layouts.wrap('page');
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