'use strict';

var utils = module.exports;

/**
 * Return true val is a non-empty string
 */

utils.isString = function(val) {
  return val && typeof val === 'string';
};

/**
 * Format an error message
 */

utils.error = function(re, tag, name) {
  var delims = utils.matchDelims(re, tag);
  return 'cannot find tag "' + delims + '" in "' + name + '"';
};

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
