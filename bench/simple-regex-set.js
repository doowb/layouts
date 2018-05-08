'use strict';

const path = require('path');
const getFile = require('../get-file');

function build(file, layouts = {}, options = {}) {
  const stack = file.layoutStack || [];
  const key = options.layoutKey || 'layout';
  const tag = options.layoutTag || /{%\s*body\s*%}/g;
  const resolveKey = options.resolveKey;

  let name = getLayoutName(file, options);
  if (!name) return file;

  let layout = getFile(layouts, name, { resolveKey });
  assertLayout(name, layout, { file, name: file.key });
  build.cache.set(name, layout);

  let str = file.contents.toString();

  while (layout && !stack.includes(layout)) {
    stack.push(layout);

    str = layout.contents.toString().replace(tag, str);
    const prev = { file: layout, name };

    name = getLayoutName(layout, options);
    if (!name) break;

    layout = build.cache.get(name) || getFile(layouts, name, { resolveKey });
    assertLayout(name, layout, prev);
    build.cache.set(name, layout);
  }

  file.contents = Buffer.from(str);
  return file;
}

function getLayoutName(file, options) {
  const defaultLayout = options.defaultLayout;
  const key = options.layoutKey || 'layout';
  const name = file[key];
  if (typeof name === 'undefined' || name === true || name === defaultLayout) {
    return defaultLayout;
  }
  if (!name || ['false', 'null', 'nil', 'none', 'undefined'].includes(name.toLowerCase())) {
    return false;
  }
  return name;
}

function assertLayout(name, layout, prev) {
  if (!layout) {
    const filename = prev.file.relative || prev.file.path || prev.name;
    const val = filename ? `"${filename}"` : 'the given file';
    const msg = `layout "${name}" is defined on ${val} but cannot be found.`;
    const err = new Error(msg);
    err.layout = prev;
    throw err;
  }
}

build.cache = new Map();
build.clearCache = () => (build.cache = new Map());
module.exports = build;
