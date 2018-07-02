'use strict';

let exists = (() => {
  var _ref = _asyncToGenerator(function* (filePath) {
    try {
      yield access(filePath, fs.constants.F_OK);
      return true;
    } catch (e) {
      return false;
    }
  });

  return function exists(_x) {
    return _ref.apply(this, arguments);
  };
})();

let walk = (() => {
  var _ref2 = _asyncToGenerator(function* (output, prefix, lexer, opts, dirname = '', level = 0) {
    const rgx = lexer.segments[level];
    const dir = join(opts.cwd, prefix, dirname);
    const files = yield readdir(dir);
    const dot = opts.dot,
          filesOnly = opts.filesOnly;


    let i = 0,
        len = files.length,
        file;
    let fullpath, relpath, stats, isMatch;

    for (; i < len; i++) {
      fullpath = join(dir, file = files[i]);
      relpath = dirname ? join(dirname, file) : file;
      if (!dot && isHidden.test(relpath)) continue;
      isMatch = lexer.regex.test(relpath);

      if ((stats = CACHE[relpath]) === void 0) {
        CACHE[relpath] = stats = yield lstat(fullpath);
      }

      if (!stats.isDirectory()) {
        isMatch && output.push(relative(opts.cwd, fullpath));
        continue;
      }

      if (rgx && !rgx.test(file)) continue;
      !filesOnly && isMatch && output.push(join(prefix, relpath));

      yield walk(output, prefix, lexer, opts, relpath, rgx && rgx.toString() !== lexer.globstar && ++level);
    }
  });

  return function walk(_x2, _x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * Find files using bash-like globbing.
 * All paths are normalized compared to node-glob.
 * @param {String} str Glob string
 * @param {String} [options.cwd='.'] Current working directory
 * @param {Boolean} [options.dot=false] Include dotfile matches
 * @param {Boolean} [options.absolute=false] Return absolute paths
 * @param {Boolean} [options.filesOnly=false] Do not include folders if true
 * @param {Boolean} [options.flush=false] Reset cache object
 * @returns {Array} array containing matching files
 */


function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const fs = require('fs');
const globrex = require('globrex');

var _require = require('util');

const promisify = _require.promisify;

const globalyzer = require('globalyzer');

var _require2 = require('path');

const join = _require2.join,
      resolve = _require2.resolve,
      relative = _require2.relative;

const isHidden = /(^|[\\\/])\.[^\\\/\.]/g;
const readdir = promisify(fs.readdir);
const lstat = promisify(fs.lstat);
const access = promisify(fs.access);
let CACHE = {};

module.exports = (() => {
  var _ref3 = _asyncToGenerator(function* (str, opts = {}) {
    let glob = globalyzer(str);

    if (!glob.isGlob) {
      return (yield exists(str)) ? [str] : [];
    }
    if (opts.flush) CACHE = {};

    let matches = [];
    opts.cwd = opts.cwd || '.';

    var _globrex = globrex(glob.glob, { filepath: true, globstar: true, extended: true });

    const path = _globrex.path;


    path.globstar = path.globstar.toString();
    yield walk(matches, glob.base, path, opts, '.', 0);

    return opts.absolute ? matches.map(function (x) {
      return resolve(opts.cwd, x);
    }) : matches;
  });

  return function (_x6) {
    return _ref3.apply(this, arguments);
  };
})();