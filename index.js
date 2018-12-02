const fs = require('fs');
const globrex = require('globrex');
const { promisify } = require('util');
const globalyzer = require('globalyzer');
const { join, resolve, relative } = require('path');
const absOrRelPath = (ysn) => ysn ? resolve : relative;
const isHidden = /(^|[\\\/])\.[^\\\/\.]/g;
const readdir = promisify(fs.readdir);

let CACHE = {};

async function walk(output, prefix, lexer, opts, dirname='', level=0) {
  const rgx = lexer.segments[level];
  const { cwd, dot, filesOnly, mount } = opts;
  const dir = join(cwd, prefix, dirname);
  const files = await readdir(dir);

  let i=0, len=files.length, file;
  let fullpath, relpath, stats, isMatch;

  for (; i < len; i++) {
    fullpath = join(dir, file=files[i]);
    relpath = dirname ? join(dirname, file) : file;
    if (!dot && isHidden.test(relpath)) continue;
    isMatch = lexer.regex.test(relpath);

    if ((stats=CACHE[relpath]) === void 0) {
      CACHE[relpath] = stats = fs.lstatSync(fullpath);
    }

    if (!stats.isDirectory()) {
      isMatch && output.push(mount(cwd, fullpath));
      continue;
    }

    if (rgx && !rgx.test(file)) continue;

    !filesOnly && isMatch && output.push(mount(cwd, fullpath));

    await walk(output, prefix, lexer, opts, relpath, rgx && rgx.toString() !== lexer.globstar && ++level);
  }
}

/**
 * Find files using bash-like globbing.
 * All paths are normalized compared to node-glob.
 * @param {String} str Glob string
 * @param {String} [options.cwd='.'] Current working directory
 * @param {Boolean} [options.dot=false] Include dotfile matches
 * @param {Boolean} [options.absolute=false] Return absolute paths
 * @param {Boolean} [options.filesOnly=false] Do not include folders if true
 * @param {Boolean} [options.flush=false] Reset cache object
 * @param {Function} [options.mount] Optional custom object constructor
 * @returns {Array} array containing matching files
 */
module.exports = async function (str, opts={}) {
  if (!str) return [];

  let glob = globalyzer(str);

  opts.cwd = opts.cwd || '.';

  if (!glob.isGlob) {
    let resolved = resolve(opts.cwd, str);
    if (!fs.existsSync(resolved)) return []

    return opts.absolute ? [resolved] : [str];
  }

  if (opts.flush) CACHE = {};

  let matches = [];
  const { path } = globrex(glob.glob, { filepath:true, globstar:true, extended:true });
  path.globstar = path.globstar.toString();

  const mountPath = absOrRelPath(opts.absolute);
  if (typeof opts.mount === 'function') {
    let _mount = opts.mount;
    // the custom mount function should receive the same
    // absolute or relative path that is the default output
    opts.mount = (cwd, path) => _mount(mountPath(cwd, path));
  } else {
    opts.mount = mountPath;
  }

  await walk(matches, glob.base, path, opts, '.', 0);

  return matches;
};
