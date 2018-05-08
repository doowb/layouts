const path = require('path');

class View {
  constructor(view) {
    define(this, 'collection', null);
    define(this, '_key', null);
    Object.assign(this, view);
  }

  set key(key) {
    if (key === this._key) return;
    if (this.collection) {
      this.collection.views.set(key, this);
      this.collection.views.delete(this._key);
    }
    this._key = key;
  }
  get key() {
    return this._key;
  }
}

class Collection {
  constructor(options = {}) {
    this.options = options;
    this.views = new Map();
  }
  view(key, val) {
    if (typeof key === 'string') {
      if (typeof val === 'undefined') {
        return this.views.get(key);
      }
      val = { path: key };
    } else {
      val = key;
      key = null;
    }
    const view = new View(val);
    view.collection = this;
    view.key = key || this.renameKey(view);
    this.views.set(key, view);
    return view;
  }

  renameKey(view) {
    if (this.options.renameKey) {
      return this.options.renameKey(view);
    }
    return view.key || view.path;
  }
}


const pages = new Collection();

pages.view('foo', { contents: Buffer.from('abc') });

const view = pages.view('foo');
// console.log(view)
view.key = path.join(process.cwd(), 'foo.hbs');
console.log(pages)


function define(app, key, val) {
  Reflect.defineProperty(app, key, {
    writable: true,
    configurable: true,
    enumerable: false,
    value: val
  });
}
