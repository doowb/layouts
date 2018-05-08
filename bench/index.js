const path = require('path');
const argv = require('minimist')(process.argv.slice(2), {
  alias: { b: 'build', c: 'compiled' }
});

const { layouts, file } = require('./fixtures');
const fns = {
  current: require('../index'),
  a: require('./customizable'),
  b: require('./simple-regex-paths'),
  c: require('./simple-regex-set'),
  d: require('./simple-regex'),
  e: require('./simple'),
};

const build = fns[argv.build] || fns.current;

const timer = () => {
  const start = process.hrtime();
  return () => {
    return process.hrtime(start);
  }
};

function ns(n) {
  return n[0] * 1e9 + n[1];
}
function mµ(n) {
  return ns(n) / 1e3;
}
function ms(n) {
  return mµ(n) / 1e3;
}
function sec(n) {
  return ms(n) / 1e3;
}

let time = timer();
let diff = timer('diff');
const buf = file.contents;
const reset = () => (file.contents = buf);
const num = 1000000;
let inc = (num / 20);
let n = 0;
let i = 0;

const cache = {};
const resolveLayout = (layouts, name) => {
  if (layouts[name]) return layouts[name];
  if (cache[name]) return cache[name];
  const key = name[0] !== '/' ? path.join(process.cwd(), name + '.hbs') : name;
  let layout = layouts[key];
  if (!layout) layout = layouts[path.basename(name, path.extname(name))];
  if (layout) cache[name] = layout;
  return layout;
};

while (i++ < num) {
  build(file, layouts, { compiled: argv.compiled, resolveLayout });
  // console.log(file.contents.toString());
  reset();
  // if (i >= 10) process.exit()
}

function size(obj) {
  return obj instanceof Map ? obj.size : Object.keys(obj).length;
}

const total = time();
const stamp = ms(total).toFixed(2) + 'ms';
const elapsed = sec(total).toFixed(2) + 's';
const len = size(layouts);
const actual = num * len; // size of the layout stack

console.log('processed %s layouts in %s', actual.toLocaleString(), elapsed);
console.log('1 layout per %s', (mµ(total) / actual).toFixed(4) + 'mµ');
