const renderLayouts = require('..');

const file1 = {
  contents: Buffer.from('<div>Wrap me with a layout!!!</div>'),
  layout: 'one'
};
const file2 = {
  contents: Buffer.from('<div>Wrap me with a layout!!!</div>'),
  layout: 'one'
};

const layouts = {
  one: { contents: Buffer.from('one before\n{% body %}\none after'), layout: 'two' },
  two: { contents: Buffer.from('two before\n{% body %}\ntwo after') }
};

console.log(renderLayouts(file1, layouts).contents.toString());
console.log();
console.log(renderLayouts(file2, layouts).contents.toString());
// two before
// one before
// <div>Wrap me with a layout!!!</div>
// one after
// two after
