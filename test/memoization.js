'use strict';

require('mocha');
const assert = require('assert');
const layouts = require('..');

describe('memoized regex:', function() {
  beforeEach(() => layouts.clearCache());

  it('should memoize created regex', function() {
    const layoutStack = { default: { contents: Buffer.from('above\n{{ body }}\nbelow') } };
    const file = { contents: Buffer.from('this is contents'), layout: 'default', path: 'foo' };
    const options = { layoutDelims: ['{{', '}}'] };

    layouts(file, layoutStack, options);
    assert.equal(layouts.memo.size, 1);
  });

  it('should clear memoized regex', function() {
    const layoutStack = { default: { contents: Buffer.from('above\n{{ body }}\nbelow') } };
    const file = { contents: Buffer.from('this is contents'), layout: 'default', path: 'foo' };
    const options = { layoutDelims: ['{{', '}}'] };

    layouts(file, layoutStack, options);
    assert.equal(layouts.memo.size, 1);
    layouts.clearCache();
    assert.equal(layouts.memo.size, 0);
  });
});
