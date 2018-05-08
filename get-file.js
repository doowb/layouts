'use strict';

const path = require('path');
const pathEndsWith = require('path-ends-with');

function getFile(files, name) {
  if (files instanceof Map) {
    if (files.has(name)) return files.get(name);
    for (const [key, file] of files) {
      if (isMatch(file, key, name)) {
        return file;
      }
    }
    return null;
  }

  if (!isObject(files)) {
    throw new TypeError('expected "files" to be an object or instance of Map');
  }

  if (files.hasOwnProperty(name)) {
    return files[name];
  }

  for (const key of Object.keys(files)) {
    const file = files[key];
    if (isMatch(file, key, name)) {
      return file;
    }
  }
  return null;
}

function isMatch(file, key, name) {
  if (name === key || name === file.key || name === file.path) return true;
  if (!file.path && !file.key) return false;

  if (typeof name === 'function') {
    return name(file);
  }

  if (name instanceof RegExp) {
    return name.test(file.path) || (file.history && name.test(file.history[0]));
  }

  const extname = file.extname || path.extname(file.path);
  const stem = file.stem || path.basename(file.path, extname);
  if (name === file) {
    return true;
  }

  const basename = file.basename || stem + extname;
  if (name === basename) {
    return true;
  }

  if (name === relative(file)) return true;
  if (hasPath(file, name)) return true;
  return endsWith(file, name);
}

function relative(file) {
  return file.relative || path.relative(file.cwd || process.cwd(), file.path);
}

function hasPath(file, name) {
  return typeof file.hasPath === 'function' && file.hasPath(name);
}

function endsWith(file, name) {
  if (pathEndsWith(file.path, name)) {
    return true;
  }
  return file.history && pathEndsWith(file.history[0], name);
}

function isObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

getFile.isMatch = isMatch;
module.exports = getFile;
