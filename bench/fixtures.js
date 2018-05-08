const argv = require('minimist')(process.argv.slice(2), {
  alias: { a: 'absolute', m: 'map', p: 'prop' }
});

const path = require('path');
const fp = name => path.join(process.cwd(), name + '.hbs');

const file = {
  contents: Buffer.from('<div>Wrap me with a layout!!!</div>'),
  layout: fp('aaa')
};

// let layouts = {
//   [fp('aaa')]: { contents: Buffer.from('aaa before\n{% body %}\naaa after'),layout: fp('bbb')},
//   [fp('bbb')]: { contents: Buffer.from('bbb before\n{% body %}\nbbb after'),layout: fp('ccc')},
//   [fp('ccc')]: { contents: Buffer.from('ccc before\n{% body %}\nccc after'),layout: fp('ddd')},
//   [fp('ddd')]: { contents: Buffer.from('ddd before\n{% body %}\nddd after'),layout: fp('eee')},
//   [fp('eee')]: { contents: Buffer.from('eee before\n{% body %}\neee after'),layout: fp('fff')},
//   [fp('fff')]: { contents: Buffer.from('fff before\n{% body %}\nfff after'),layout: fp('ggg')},
//   [fp('ggg')]: { contents: Buffer.from('ggg before\n{% body %}\nggg after'),layout: fp('hhh')},
//   [fp('hhh')]: { contents: Buffer.from('hhh before\n{% body %}\nhhh after'),layout: fp('iii')},
//   [fp('iii')]: { contents: Buffer.from('iii before\n{% body %}\niii after'),layout: fp('jjj')},
//   [fp('jjj')]: { contents: Buffer.from('jjj before\n{% body %}\njjj after'),layout: fp('lll')},
//   [fp('lll')]: { contents: Buffer.from('lll before\n{% body %}\nlll after') },
// };
let layouts = {
  aaa: { contents: Buffer.from('aaa before\n{% body %}\naaa after'),layout: fp('bbb')},
  bbb: { contents: Buffer.from('bbb before\n{% body %}\nbbb after'),layout: fp('ccc')},
  ccc: { contents: Buffer.from('ccc before\n{% body %}\nccc after'),layout: fp('ddd')},
  ddd: { contents: Buffer.from('ddd before\n{% body %}\nddd after'),layout: fp('eee')},
  eee: { contents: Buffer.from('eee before\n{% body %}\neee after'),layout: fp('fff')},
  fff: { contents: Buffer.from('fff before\n{% body %}\nfff after'),layout: fp('ggg')},
  ggg: { contents: Buffer.from('ggg before\n{% body %}\nggg after'),layout: fp('hhh')},
  hhh: { contents: Buffer.from('hhh before\n{% body %}\nhhh after'),layout: fp('iii')},
  iii: { contents: Buffer.from('iii before\n{% body %}\niii after'),layout: fp('jjj')},
  jjj: { contents: Buffer.from('jjj before\n{% body %}\njjj after'),layout: fp('lll')},
  lll: { contents: Buffer.from('lll before\n{% body %}\nlll after') },
};
// console.log(layouts)
// const map = new Map();
// if (argv.obj || argv.map) {
//   for (const key of Object.keys(layouts)) {
//     const layout = layouts[key];
//     delete layouts[key];
//     layout.key = key;
//     layout.stem = key;
//     layout.basename = key + '.hbs';
//     layout.extname = '.hbs';
//     layout.path = path.join(process.cwd(), layout.basename);
//     if (argv.a) layout.layout = fp(layout.layout);
//     const prop = argv.prop ? layout[argv.prop] : layout.path;
//     layouts[prop] = layout;
//     map.set(prop, layout);
//     console.log(prop)
//     console.log(layout.layout)
//   }

//   if (argv.map) layouts = map;
// }

module.exports = { layouts, file };
