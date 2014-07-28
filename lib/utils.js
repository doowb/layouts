var path = require('path');
var matter = require('gray-matter');
var fs = require('fs');

exports.read = function(cwd, filepath) {
  var dir = path.join(process.cwd(), cwd, filepath);
  return fs.readFileSync(dir + '.tmpl', 'utf8');
};

exports.strip = function(str) {
  return str.replace(/<.>\s*/, '');
};

exports.parse = function(str) {
  var simple = /^<(.)>/;
  var re = /(?:<(.)>)?([\s\S]+)?/;
  var layout = null;
  var content = '';

  if (simple.test(str)) {
    var matches = str.match(re);
    layout = matches[1];
    content = matches[2];
  }
  return {layout: layout, content: content};
};