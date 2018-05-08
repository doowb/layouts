const layouts = require('..');

const file = {
  contents: Buffer.from('<div>Wrap me with a layout!!!</div>'),
  layout: 'aaa'
};

const collection = {
  aaa: { contents: Buffer.from('aaa before\n{% body %}\naaa after'), layout: 'bbb' },
  bbb: { contents: Buffer.from('bbb before\n{% body %}\nbbb after'), layout: 'ccc' },
  ccc: { contents: Buffer.from('ccc before\n{% body %}\nccc after'), layout: 'ddd' },
  ddd: { contents: Buffer.from('ddd before\n{% body %}\nddd after'), layout: 'eee' },
  eee: { contents: Buffer.from('eee before\n{% body %}\neee after'), layout: 'fff' },
  fff: { contents: Buffer.from('fff before\n{% body %}\nfff after'), layout: 'ggg' },
  ggg: { contents: Buffer.from('ggg before\n{% body %}\nggg after'), layout: 'hhh' },
  hhh: { contents: Buffer.from('hhh before\n{% body %}\nhhh after'), layout: 'iii' },
  iii: { contents: Buffer.from('iii before\n{% body %}\niii after'), layout: 'jjj' },
  jjj: { contents: Buffer.from('jjj before\n{% body %}\njjj after'), layout: 'lll' },
  lll: { contents: Buffer.from('lll before\n{% body %}\nlll after') },
};

const timer = name => {
  const start = process.hrtime();
  return () => {
    const diff = ms(process.hrtime(start)).toFixed(2) + 'ms';
    console.log(name, diff);
  }
};

function ms(ns) {
  return ((+ns[0] * 1e9) + +ns[1]) / 1e6;
}

let time = timer('compiled');
let diff = timer('diff');
const buf = file.contents;
const max = 1000000;
let inc = (max / 20);
let i = 0;
let n = 0;

while (i++ < max) {
  layouts(file, collection);
  // console.log(file.contents.toString());
  file.contents = buf;
}

time();
