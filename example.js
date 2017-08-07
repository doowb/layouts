'use strict';

var File = require('vinyl');
var layouts = require('./');
var stack = {
  'default': {
    content: 'default above\n{% body %}\ndefault below'
  },
  aaa: {
    content: 'aaa\n{% head %}\nabove\n{% body %}\naaa\n{% foot %}\nbelow',
    layout: 'default'
  },
  bbb: {
    content: 'bbb\n{% head %}\nabove\n{% body %}\nbbb\n{% foot %}\nbelow',
    layout: 'aaa'
  },
  ccc: {
    content: 'ccc\n{% head %}\nabove\n{% body %}\nccc\n{% foot %}\nbelow',
    layout: 'bbb'
  },
  ddd: {
    // layout: 'ccc',
    content: 'ddd\n{% block "head" %}\nLayout above\n{% endblock %}\n{% body %}\nLayout after body\n{% block "foot" %}Layout foo\n{% endblock %}\nbelow'
  }
};

var file = new File({
  path: 'foo',
  contents: new Buffer([
    '{% block "head" %}',
    'New head contents',
    '{% endblock %}',
    'This is page contents.',
    '{% block "foot" %}',
    'New head contents',
    '{% endblock %}'
  ].join('\n'))
});

file.layout = 'ddd';

var res = layouts(file, stack).content;
console.log(res);
