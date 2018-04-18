const assert = require('assert');
const { promisify } = require('util');
const { order } = require('../test/helpers');
const glob = promisify(require('glob'));
const fast = require('fast-glob');
const tiny = require('../');

let prev;

module.exports = async function (str, opts) {
  let fn, tmp;
  for (fn of [glob, fast, tiny]) {
    tmp = await fn(str, opts).then(order);
    prev && assert.deepEqual(tmp, prev);
    prev = tmp;
  }
}
