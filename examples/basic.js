const renderLayouts = require('..');

const file = {
  contents: Buffer.from('<div>Wrap me with a layout!!!</div>'),
  layout: 'one'
};

const layoutCollection = {
  one: { contents: Buffer.from('one before\n{% body %}\none after'), layout: 'two' },
  two: { contents: Buffer.from('two before\n{% body %}\ntwo after') }
};

const res = renderLayouts(file, layoutCollection);
console.log(res.contents.toString());
// two before
// one before
// <div>Wrap me with a layout!!!</div>
// one after
// two after
