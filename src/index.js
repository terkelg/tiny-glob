const fs = require('fs');
const globrex = require('globrex');
const { promisify } = require('util');
const { join, resolve, basename, relative } = require('path');
const { isGlob, toGlob, toPath } = require('./util');

const isHidden = /(^|\/)\.[^\/\.]/g;
const giveup = rgx => !rgx || rgx == '/^((?:[^\\/]*(?:\\/|$))*)$/';
const readdir = promisify(fs.readdir);

const CACHE = {};

async function walk(output, prefix, lexer, opts, dirname='', level=0) {
  const rgx = lexer.segments[level];
  const dir = join(opts.cwd, prefix, dirname);
  const files = await readdir(dir);

  let i=0, len=files.length, file;
  let fullpath, relpath, stats, isMatch;

  for (; i < len; i++) {
    fullpath = join(dir, file=files[i]);
    relpath = dirname ? join(dirname, file) : file;
    if (!opts.dot && isHidden.test(relpath)) continue;
    isMatch = lexer.regex.test(relpath);

    if ((stats=CACHE[relpath]) === void 0) {
      CACHE[relpath] = stats = fs.lstatSync(fullpath);
    }

    if (!stats.isDirectory()) {
      isMatch && output.push(relative(opts.cwd, fullpath));
      continue;
    }

    if (rgx && !rgx.test(file)) continue;
    isMatch && output.push(join(prefix, relpath));

    await walk(output, prefix, lexer, opts, relpath, giveup(rgx) ? null : level + 1);
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
  const cwd = opts.cwd = opts.cwd || '.';
  const patterns = globrex(toGlob(str), { globstar:true, extended:true });

  await walk(matches, toPath(str), patterns, opts, '.', 0);

  return matches;
};
