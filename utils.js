var lazy = module.exports = require('lazy-cache')(require);
lazy('falsey', 'isFalsey');
lazy('is-buffer', 'isBuffer');
lazy('delimiter-regex', 'delims');
