# layouts [![NPM version](https://badge.fury.io/js/layouts.svg)](http://badge.fury.io/js/layouts)  [![Build Status](https://travis-ci.org/doowb/layouts.svg)](https://travis-ci.org/doowb/layouts)

> Wraps templates with layouts. Layouts can use other layouts and be nested to any depth. This can be used 100% standalone to wrap any kind of file with banners, headers or footer content. Use for markdown, HTML, handlebars views, lo-dash templates, etc. Layouts can also be vinyl files.

## Install

Install with [npm](https://www.npmjs.com/)

```sh
$ npm i layouts --save
```

## Usage

```js
var renderLayouts = require('layouts');
```

## Examples

**Basic example**

In this example, two layouts are used:

* the first layout, `one`, will wrap the string
* the second layout, `two`, will wrap the first layout

```js
var layouts = {
  one: {content: 'one before\n{% body %}\none after', layout: 'two'},
  two: {content: 'two before\n{% body %}\ntwo after'},
};

// `one` is the name of the first layout to use on the provided string
renderLayouts('<div>Wrap me with a layout!!!</div>', 'one', layouts);
```

Results in:

```html
two before
one before
<div>Wrap me with a layout!!!</div>
one after
two after
```

**HTML**

This example shows how to use nested HTML layouts to wrap content:

```js
var layouts = {};

layouts.base = {
  content: [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '  <head>',
    '    <meta charset="UTF-8">',
    '    <title>Home</title>',
    '  </head>',
    '  <body>',
    '    {% body %}',
    '  </body>',
    '</html>',
  ].join('\n')
};

// this `nav` layout will be wrapped with the `base` layout
layouts.nav = {
  layout: 'base',
  content: '<nav>\n{% body %}\n</nav>'
};

// this string will be wrapped with the `nav` layout
var str = [
  '<ul class="categories">',
  '  <li class="active"> <a href="#"> Development </a> </li>',
  '  <li> <a href="#"> Design </a> </li>',
  '  <li> <a href="#"> Node.js </a> </li>',
  '</ul>'
].join('\n')

// `nav` is the name of the layout to use
renderLayouts(str, nav, layouts);
```

Results in something like:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Home</title>
  </head>
  <body>
    <nav>
      <ul class="categories">
        <li class="active"> <a href="#"> Development </a> </li>
        <li> <a href="#"> Design </a> </li>
        <li> <a href="#"> Node.js </a> </li>
      </ul>
    </nav>
  </body>
</html>
```

## Customization

By default, `{% body %}` is used as the placeholder (insertion point) for content, but this can easily be customized with the following options:

* `layoutDelims`: the delimiters to use. This can be a regex, like `/\{{([^}]+)\}}/`, or an array of delimiter strings, like `['{{', '}}']`
* `tag`: the name of the placeholder tag.

## API

### [renderLayouts](index.js#L36)

Wrap one or more layouts around `string`.

**Params**

* `string` **{String}**: The string to wrap with a layout.
* `layoutName` **{String}**: The name (key) of the layout object to use.
* `layoutStack` **{Object}**: Object of layout objects.
* `options` **{Object}**: Optionally define a `defaultLayout` (string), pass custom delimiters (`layoutDelims`) to use as the placeholder for the content insertion point, or change the name of the placeholder tag with the `tag` option.
* `fn` **{Function}**: Optionally pass a function to modify the context as each layout is applied.
* `returns` **{String}**: Returns the original string wrapped with one or more layouts.

**Example**

```js
renderLayouts(string, layoutName, layoutStack, options, fn);
```

## Related

* [assemble](https://www.npmjs.com/package/assemble): Static site generator for Grunt.js, Yeoman and Node.js. Used by Zurb Foundation, Zurb Ink, H5BP/Effeckt,… [more](https://www.npmjs.com/package/assemble) | [homepage](http://assemble.io)
* [handlebars-layouts](https://www.npmjs.com/package/handlebars-layouts): Handlebars helpers which implement layout blocks similar to Jade, Jinja, Swig, and Twig. | [homepage](https://github.com/shannonmoeller/handlebars-layouts)
* [inject-snippet](https://www.npmjs.com/package/inject-snippet): Inject a snippet of code or content into a string. | [homepage](https://github.com/jonschlinkert/inject-snippet)
* [templates](https://www.npmjs.com/package/templates): System for creating and managing template collections, and rendering templates with any node.js template engine.… [more](https://www.npmjs.com/package/templates) | [homepage](https://github.com/jonschlinkert/templates)

## Running tests

Install dev dependencies:

```sh
$ npm i -d && npm test
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/doowb/layouts/issues/new).

## Author

**Brian Woodward**

+ [github/doowb](https://github.com/doowb)
+ [twitter/doowb](http://twitter.com/doowb)

## License

Copyright © 2014-2015 [Brian Woodward](https://github.com/doowb)
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on October 02, 2015._