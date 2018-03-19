const fs = require('fs');
const path = require('path');
const renderLayouts = require('..');
const templates = path.join.bind(path, __dirname, 'templates');

const file = {
  contents: Buffer.from('<div>Wrap me with a layout!!!</div>'),
  layout: 'two-col'
};

const layoutCollection = {
  'default': { contents: fs.readFileSync(templates('default.html')) },
  'two-col': { contents: fs.readFileSync(templates('two-col.html')), layout: 'default' }
};

renderLayouts(file, layoutCollection);

console.log(file.contents.toString());
