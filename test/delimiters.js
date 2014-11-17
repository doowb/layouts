/*!
 * layouts <https://github.com/jonschlinkert/layouts>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Layouts = require('..');


describe('layout delimiters', function () {
  var layouts = new Layouts();

  it('should use default delimiters.', function () {
    var actual = layouts.replaceTag('INNER', '{%= body %}[[body]]{%body%}{% body %}<%body%>');
    actual.should.eql('INNER[[body]]{%body%}{% body %}<%body%>');
  });
  it('should use custom delimiters.', function () {
    var actual = layouts.replaceTag('INNER', '{%= body %}[[body]]{%body%}{% body %}<%body%>', {delims: ['{%', '%}']});
    actual.should.eql('{%= body %}[[body]]INNERINNER<%body%>');
  });
  it('should use custom delimiters.', function () {
    var actual = layouts.replaceTag('INNER', '{{ body }}[[body]]{%body%}{% body %}<%body%>', {delims: ['{{', '}}']});
    actual.should.eql('INNER[[body]]{%body%}{% body %}<%body%>');
  });
  it('should use custom delimiters.', function () {
    var actual = layouts.replaceTag('INNER', '{%= body %}[[body]]{%body%}{% body %}<%body%>', {delims: ['[[', ']]']});
    actual.should.eql('{%= body %}INNER{%body%}{% body %}<%body%>');
  });
  it('should use custom delimiters.', function () {
    var actual = layouts.replaceTag('INNER', '{%= body %}[[body]]{%body%}{% body %}<%body%>', {delims: ['<%', '%>']});
    actual.should.eql('{%= body %}[[body]]{%body%}{% body %}INNER');
  });
  it('should use custom delimiters.', function () {
    var actual = layouts.replaceTag('INNER', '<<% body %>>{%= body %}[[body]]{%body%}{% body %}<%body%>', {delims: ['<<%', '%>>']});
    actual.should.eql('INNER{%= body %}[[body]]{%body%}{% body %}<%body%>');
  });
});
