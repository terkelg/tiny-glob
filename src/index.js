const fs = require('fs');
const globrex = require('globrex');
const { promisify } = require('util');
const { join, resolve, basename, relative } = require('path');
const { isGlob, toGlob, toPath } = require('./util');

const isHidden = /(^|\/)\.[^\/\.]/g;
const giveup = rgx => !rgx || rgx == '/^((?:[^\\/]*(?:\\/|$))*)$/';
const readdir = promisify(fs.readdir);

const CACHE = {};

async function walk(output, rootDir, lexer, opts, dirname='', level=0) {
  const dir = join(rootDir, dirname);
  const rgx = lexer.segments[level];
  const files = await readdir(dir);

  let i=0, len=files.length, file, val;
  let fullpath, relpath, stats, isMatch;

  for (; i < len; i++) {
    fullpath = join(dir, file=files[i]);
    relpath = dirname ? join(dirname, file) : file;
    if (!opts.dot && isHidden.test(relpath)) continue;
    isMatch = lexer.regex.test(relpath);

    if ((stats=CACHE[fullpath]) === void 0) {
      CACHE[fullpath] = stats = fs.lstatSync(fullpath);
    }

    if (!stats.isDirectory()) {
      isMatch && output.push(fullpath);
      continue;
    }

    if (rgx && !rgx.test(file)) continue;
    isMatch && output.push(fullpath);

    walk(output, rootDir, lexer, opts, relpath, giveup(rgx) ? null : level + 1);
  }
}

/**
 * Find files using bash-like globbing.
 * All paths are normalized compared to node-glob.
 * @param {String} str Glob string
 * @param {String} [options.cwd='.'] Current working directory
 * @param {Boolean} [options.dot=false] Include dotfile matches
 * @returns {Array} array containing matching files
 */
module.exports = async function (str, opts={}) {
  if (!isGlob(str)) {
    return fs.existsSync(str) ? [str] : [];
  }

  let matches = [];
  const pfx = toPath(str);
  const cwd = opts.cwd || '.';
  const patterns = globrex(toGlob(str), { globstar:true, extended:true });

  await walk(matches, resolve(cwd, pfx), patterns, opts, '.', 0);

  return opts.absolute ? matches : matches.map(x => relative(cwd, x) || join(pfx, basename(x)));
};
