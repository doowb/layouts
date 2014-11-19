'use strict';

var token = '{% body %}';

module.exports = function(str, content, options) {
  if (options && (options.tag || options.delims)) {
    token = makeToken(options);
  }
  return replace(str, token, content);
};

function replace(str, token, replacement) {
  var i = str.indexOf(token);
  if (i > -1) {
    str = str.replace(token, replacement);
    i = i + replacement.length;
    var res = str.substr(i);
    if (res.indexOf(token) > -1) {
      str = str.substr(0, i) + replace(res, token, replacement);
    }
  }
  return str;
}

function makeToken(options) {
  options = options || {};
  var a = '{%';
  var b = '%}';

  if (Array.isArray(options.delims)) {
    a = (options.delims[0] || '{%').trim();
    b = (options.delims[1] || '%}').trim();
  }

  return a
    + ' '
    + (options.tag || 'body').trim()
    + ' '
    + b;
}