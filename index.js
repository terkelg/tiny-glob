const fs = require('fs');
const globrex = require('globrex');
const globalyzer = require('globalyzer');

const isWin = process.platform === 'win32';
const {
  join,
  resolve,
  relative
} = require('path');
const {
  promisify
} = require('util');

const isHidden = /(^|\/)\.[^/.]/g;
// eslint-disable-next-line
const giveup = rgx => !rgx || rgx == '/^((?:[^\\/]*(?:\\/|$))*)$/';
const readdir = promisify(fs.readdir);

let CACHE = {};

async function walk(output, prefix, lexer, opts, dirname = '', level = 0) {
  const rgx = lexer.segments[level];
  const dir = join(opts.cwd, prefix, dirname);
  const files = await readdir(dir);
  const {
    dot,
    filesOnly
  } = opts;

  let i = 0;
  const len = files.length;
  let file;
  let fullpath;
  let relpath;
  let stats;
  let isMatch;
  let tmp;

  for (; i < len; i += 1) {
    fullpath = join(dir, file = files[i]);
    relpath = dirname ? join(dirname, file) : file;
    if (!dot && isHidden.test(relpath)) continue; // eslint-disable-line

    if (isWin) {
      tmp = relpath.replace(/\\/g, '/')
    } else {
      tmp = relpath
    }

    isMatch = lexer.regex.test(tmp);

    if (CACHE[relpath]) {
      stats = CACHE[relpath]
    } else {
      stats = fs.lstatSync(fullpath);
      CACHE[relpath] = stats
    }

    if (!stats.isDirectory()) {
      if (isMatch) {
        output.push(relative(opts.cwd, fullpath));
      }
      continue; //eslint-disable-line
    }

    if (rgx && !rgx.test(file)) continue; //eslint-disable-line

    if (!filesOnly && isMatch) {
      output.push(join(prefix, relpath));
    }

    // eslint-disable-next-line
    await walk(output, prefix, lexer, opts, relpath, giveup(rgx) ? null : level +
      1);
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
 * @returns {Array} array containing matching files
 */
module.exports = async (str, opts = {}) => {
  const glob = globalyzer(str);

  if (!glob.isGlob) return fs.existsSync(str) ? [str] : [];
  if (opts.flush) CACHE = {};

  const matches = [];

  // eslint-disable-next-line
  opts.cwd = opts.cwd || '.';

  const patterns = globrex(glob.glob, {
    globstar: true,
    extended: true
  });

  await walk(matches, glob.base, patterns, opts, '.', 0);

  return opts.absolute ? matches.map(x => resolve(opts.cwd, x)) : matches;
};
