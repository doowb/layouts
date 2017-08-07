'use strict';

var utils = module.exports;

/**
 * Only used if an error is thrown. Attempts to recreate
 * delimiters for the error message.
 */

utils.types = {
  '{%=': function(str) {
    return '{%= ' + str + ' %}';
  },
  '{%-': function(str) {
    return '{%- ' + str + ' %}';
  },
  '{%': function(str) {
    return '{% ' + str + ' %}';
  },
  '{{': function(str) {
    return '{{ ' + str + ' }}';
  },
  '<%': function(str) {
    return '<% ' + str + ' %>';
  },
  '<%=': function(str) {
    return '<%= ' + str + ' %>';
  },
  '<%-': function(str) {
    return '<%- ' + str + ' %>';
  }
};

utils.matchDelims = function(regex, tagname) {
  // var source = regex.source.split('(\\s*)').join('');
  var ch = regex.source.slice(0, 4);
  if (/[\\]/.test(ch.charAt(0))) {
    ch = ch.slice(1);
  }
  if (!/[-=]/.test(ch.charAt(2))) {
    ch = ch.slice(0, 2);
  } else {
    ch = ch.slice(0, 3);
  }
  return utils.types[ch](tagname);
};
