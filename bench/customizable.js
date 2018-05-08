'use strict';

function build(file, layouts = {}, options = {}) {
  let key = options.layoutKey || 'layout';
  let tag = options.layoutTag || '{% body %}';
  let layout = layouts[file[key] || options[key]];
  let str = file.contents.toString();

  const before = file.beforeLayout || options.beforeLayout;
  const after = file.afterLayout || options.afterLayout;
  const stack = [];

  while (layout && !stack.includes(layout)) {
    stack.push(layout);

    if (typeof beforeLayout === 'function') {
      str = beforeLayout(str, file, layout, stack);
    }

    if (typeof options.replace === 'function') {
      str = options.replace(tag, str, layout);
    } else {
      str = layout.contents.toString().split(tag).join(str);
    }

    // get the next layout to use
    layout = layouts[layout[key]];

    if (typeof afterLayout === 'function') {
      str = afterLayout(str, file, layout, stack);
    }
  }

  file.contents = Buffer.from(str);
  return file;
}

module.exports = build;
