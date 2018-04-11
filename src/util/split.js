'use strict';

const isglob = require('./isglob');
const { dirname }  = require('path');

/**
 * Find the static part of a glob-path,
 * split path and return path part
 * https://github.com/jonschlinkert/glob-parent
 * @param {String} str Path/glob string
 * @returns {String} static path section of glob
 */
function path(str) {
	str += 'a'; // preserves full path in case of trailing path separator
	do {str = dirname(str)} while (isglob(str));
	return str.replace(/\\([\*\?\|\[\]\(\)\{\}])/g, '$1');
};


/**
 * Split a path/glob string, and return the glob part.
 * @param {String} str Path/glob string
 * @returns {String} glob part of path
 */
function glob(str) {
    const p = path(str);
    if (p === '') return str;
    if (p === '.') {
        if (str[1] === '/') return str.substring(2);
        return str.substring(0);
    }
    return str.substring(p.length+1); // skip '/'
}

module.exports = { path, glob }
