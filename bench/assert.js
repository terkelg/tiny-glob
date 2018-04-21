const assert = require('assert');
const {
  promisify
} = require('util');
const {
  order
} = require('../test/helpers');
const glob = promisify(require('glob'));
const fast = require('fast-glob');
const tiny = require('../');

let prev;

module.exports = async (str, opts) => {
  let fn;
  let tmp;

  // eslint-disable-next-line
  for (fn of [glob, fast, tiny]) {
    // eslint-disable-next-line
    tmp = await fn(str, opts).then(order);
    if (prev) {
      assert.deepEqual(tmp, prev);
    }
    prev = tmp;
  }
}
