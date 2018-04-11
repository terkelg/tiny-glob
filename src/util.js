const { dirname }  = require('path');

const chars = { '{': '}', '(': ')', '[': ']'};

/**
 * Test if a string has an extglob
 * @param {String} str Input string
 * @returns {Boolean} true if a string has an extglob
 */
function isExtglob(str) {
  let match;
  while ((match = /(\\).|([@?!+*]\(.*\))/g.exec(str))) {
    if (match[2]) return true;
    str = str.slice(match.index + match[0].length);
  }
  return false;
}

/**
 * Detect if a string cointains glob
 * https://github.com/micromatch/is-glob
 * @param {String} str Input string
 * @param {Object} [options] Configuration object
 * @param {Boolean} [options.strict=true] Strict
 * @returns {Boolean} true if string contains glob
 */
function isGlob(str, { strict = true } = {}) {
  if (str === '')  return false;
  if (isExtglob(str)) return true;

  let regex = /\\(.)|(^!|\*|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
  let match;

  // optionally relax regex
  if (!strict) {
    regex = /\\(.)|(^!|[*?{}()[\]]|\(\?)/;
  }

  while ((match = regex.exec(str))) {
    if (match[2]) return true;
    let idx = match.index + match[0].length;

    // if an open bracket/brace/paren is escaped,
    // set the index to the next closing character
    let open = match[1];
    let close = open ? chars[open] : null;
    if (open && close) {
      let n = str.indexOf(close, idx);
      if (n !== -1) {
        idx = n + 1;
      }
    }

    str = str.slice(idx);
  }
  return false;
}

/**
 * Find the static part of a glob-path,
 * split path and return path part
 * https://github.com/jonschlinkert/glob-parent
 * @param {String} str Path/glob string
 * @returns {String} static path section of glob
 */
function toPath(str) {
  str += 'a'; // preserves full path in case of trailing path separator
  do {str = dirname(str)} while (isGlob(str));
  return str.replace(/\\([\*\?\|\[\]\(\)\{\}])/g, '$1');
}


/**
 * Split a path/glob string, and return the glob part.
 * @param {String} str Path/glob string
 * @returns {String} glob part of path
 */
function toGlob(str) {
  const p = toPath(str);
  if (p === '') return str;
  if (p === '.') {
    if (str[1] === '/') return str.substring(2);
    return str.substring(0);
  }
  return str.substring(p.length+1); // skip '/'
}

module.exports = { isGlob, toGlob, toPath };
