const fs = require('fs');
const globrex = require('globrex');
const { promisify } = require('util');
const split = require('./util/split');
const isGlob = require('./util/isglob');
const { join, sep, relative, parse } = require('path');

const readdir = promisify(fs.readdir);
const isUnixHiddenPath = path => (/(^|\/)\.[^\/\.]/g).test(path);
const giveup = rgx => !rgx || rgx == '/^((?:[^\\/]*(?:\\/|$))*)$/';
const relativeDir = (parent, child) => relative(parse(parent).name, child);

const statCache = {}

/**
 * Find files using bash-like globbing.
 * All paths are normalized compared to node-glob.
 * @param {String} str Glob string
 * @param {String} [options.cwd='.'] Current working directory
 * @param {Boolean} [options.dot=false] Include dotfile matches
 * @returns {Array} array containing matching files
 */
async function glob(str, opts={}) {
  if (!isGlob(str)) {
    try { return fs.lstatSync(str) && [str]; }
    catch(e) { return [] }
  }

  const matches = [];
  const cwd = opts.cwd || '.';
  const prefix = join(cwd, split.path(str));
  const glob = split.glob(str);
  const { segments, regex } = globrex(glob, { globstar: true, extended: true });

  async function walk(base = '', level = 0) {
    const dir = join(prefix, base || sep);
    const contents = await readdir(dir);

    // TODO: For loop for speed
    await Promise.all(contents.map(file => {
      const path = join(dir, file);
      const basepath = join(base, file);

      let stats;
      if (statCache[path]) stats = statCache[path]
      else statCache[path] = stats = fs.lstatSync(path);

      if (!stats.isDirectory()) {
        if (regex.test(basepath)) {
          if (!opts.dot && isUnixHiddenPath(basepath)) return;
          matches.push(relative(cwd, path));
        }
        return;
      }

      const rgx = segments[level];
      if (rgx && !rgx.test(file)) return;

      if (regex.test(basepath)) {
        let dir = cwd === path ? relativeDir(prefix, file) : path;
        matches.push(dir);
      }

      return walk(join(basepath, sep), giveup(rgx) ? null : level+1);
    }));
  }

  await walk();

  return matches;
};

module.exports = glob;
