/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Layouts = require('..');


describe('layouts cache', function () {
  it('should add layouts to the cache when passed to `new Layouts`.', function () {
    var layouts = new Layouts({
      cache: {
        first: { layout: 'a', content: 'I\'m a {{ title }}' },
        a: { layout: 'b', content: 'A above\n{%= body %}\nA below' },
        b: { layout: 'c', content: 'B above\n{%= body %}\nB below' },
        c: { layout: 'd', content: 'C above\n{%= body %}\nC below' },
        d: { layout: 'e', content: 'D above\n{%= body %}\nD below' },
        e: { layout: 'f', content: 'E above\n{%= body %}\nE below' },
        f: { layout: 'last', content: 'F above\n{%= body %}\nF below' },
        last: { layout: undefined, content: 'last!\n{%= body %}\nlast!' }
      }
    });
    Object.keys(layouts.cache).length.should.equal(8);
  });

  it('should add layouts to the cache when using `.setLayout()`.', function () {
    var layouts = new Layouts();

    layouts.setLayout('first', 'I\'m a {{ title }}', { layout: 'a' });
    layouts.setLayout('a', 'A above\n{%= body %}\nA below', { layout: 'b' });
    layouts.setLayout('b', 'B above\n{%= body %}\nB below', { layout: 'c' });
    layouts.setLayout('c', 'C above\n{%= body %}\nC below', { layout: 'd' });
    layouts.setLayout('d', 'D above\n{%= body %}\nD below', { layout: 'e' });
    layouts.setLayout('e', 'E above\n{%= body %}\nE below', { layout: 'f' });
    layouts.setLayout('f', 'F above\n{%= body %}\nF below', { layout: 'last' });
    layouts.setLayout('last', 'last!\n{%= body %}\nlast!', { layout: undefined });
    Object.keys(layouts.cache).length.should.equal(8);
  });
});