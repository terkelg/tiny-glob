'use strict';

const test = require('tape');
const { join } = require('path');
const glob = require('../src');
const cwd = join('test', 'fixtures');

// unixify path for cross-platform testing
const unixifyPath = filepath => process.platform === 'win32' ? filepath.replace(/\\/g, '/') : filepath;
const order = arr => arr
    .filter(file => !file.includes('.DS_Store'))
    .map(unixifyPath)
    .sort();

test('glob: standard', async t => {
    t.plan(2);
    t.equal(typeof glob, 'function', 'consturctor is a typeof function');
    t.equal(Array.isArray(await glob('')), true, 'returns array');
});

test('glob: glob', async t => {
    t.plan(13);

    t.deepEqual(unixifyPath(await glob('')), []);
    t.deepEqual(unixifyPath(await glob('.')), ['.']);
    t.deepEqual(unixifyPath(await glob('./')), ['./']);

    t.deepEqual(order(await glob('test/fixtures')), ['test/fixtures']);

    // Ideal: test/fixtures/../fixture etc
    t.deepEqual(order(await glob('test/fixtures/../*')), [
        'test/fixtures',
        'test/glob.js',
        'test/util.js',
    ]);

    t.deepEqual(order(await glob('test/fixtures/*')), [
        'test/fixtures/a.js',
        'test/fixtures/a.mp3',
        'test/fixtures/a.txt',
        'test/fixtures/b.js',
        'test/fixtures/b.txt',
        'test/fixtures/ond',
        'test/fixtures/one',
        'test/fixtures/two'
    ]);

    t.deepEqual(order(await glob('test/*.{js,txt}')), [
        'test/glob.js',
        'test/util.js',
    ]);
    t.deepEqual(order(await glob('./test/*.{js,txt}')), [
        'test/glob.js',
        'test/util.js'
    ]);

    // Ideal: ../robin-glob/test/fixtures/a.mp3
    t.deepEqual(order(await glob('../tiny-glob/**/*.{mp3}')), ['test/fixtures/a.mp3']);

    t.deepEqual(order(await glob('test/fixtures/**/*.{mp3}')), ['test/fixtures/a.mp3']);
    t.deepEqual(order(await glob('tes[tp]/fixtures/**/*.{mp3}')), ['test/fixtures/a.mp3']);
    t.deepEqual(order(await glob('test/fixtures/**/a.js')), [
        'test/fixtures/a.js',
        'test/fixtures/one/a.js',
        'test/fixtures/one/child/a.js'
    ]);

    t.deepEqual(order(await glob('test/fixtures/**/b.{js,txt}')), [
        'test/fixtures/b.js',
        'test/fixtures/b.txt',
        'test/fixtures/one/b.txt'
    ]);
});

test('glob: options.cwd', async t => {
    t.plan(2);

    t.deepEqual(order(await glob('../*', { cwd: join(cwd, 'one', 'child') })), [
        '../a.js',
        '../a.md',
        '../a.txt',
        '../b.txt',
        '../child'
    ]);

    // Ideal: ../child/a.js etc
    t.deepEqual(order(await glob('../child/*', { cwd: join(cwd, 'one', 'child') })), [
        'a.js',
        'a.md',
        'a.txt'
    ]);
});

test('glob: options.dot', async t => {
    t.plan(2);

    t.deepEqual(order(await glob('test/fixtures/*.txt', { dot: true })), [
        'test/fixtures/.a-hidden.txt',
        'test/fixtures/a.txt',
        'test/fixtures/b.txt'
    ]);

    t.deepEqual(order(await glob('test/fixtures/*.txt', { dot: false })), [
        'test/fixtures/a.txt',
        'test/fixtures/b.txt'
    ]);

});
