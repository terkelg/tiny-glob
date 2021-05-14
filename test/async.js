import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { join, resolve } from 'path';

import { order, unixify } from './helpers';
import glob from '../src/async';

const cwd = join(__dirname, 'fixtures');

async function isMatch(str, opts, arr) {
  arr = arr.map(unixify);
  let val = await glob(str, opts).then(order);
  assert.equal(val, arr);
}

test('glob: standard', async () => {
  assert.type(glob, 'function', 'consturctor is a typeof function');
  assert.instance(await glob(''), Array, 'returns array');
});

test('glob: glob', async () => {
  assert.equal(await glob(''), []);
  assert.equal(await glob('.'), ['.']);
  assert.equal(await glob('./'), ['./']);

  await isMatch('test/fixtures', {}, ['test/fixtures']);

  // Ideal: test/fixtures/../fixture etc
  await isMatch('test/fixtures/../*', {}, [
    'test/async.js',
    'test/fixtures',
    'test/helpers'
  ]);

  await isMatch('test/fixtures/*', {}, [
    'test/fixtures/a.js',
    'test/fixtures/a.mp3',
    'test/fixtures/a.txt',
    'test/fixtures/b.js',
    'test/fixtures/b.txt',
    'test/fixtures/deep',
    'test/fixtures/ond',
    'test/fixtures/one',
    'test/fixtures/two'
  ]);

  await isMatch('test/*.{js,txt}', {}, [
    'test/async.js'
  ]);

  await isMatch('./test/*.{js,txt}', {}, [
    'test/async.js'
  ]);

  // Ideal: ../[parent]/test/fixtures/a.mp3
  await isMatch('../tiny-glob/**/*.{mp3}', {}, ['test/fixtures/a.mp3']);

  await isMatch('test/fixtures/**/*.{mp3}', {}, ['test/fixtures/a.mp3']);
  await isMatch('tes[tp]/fixtures/**/*.{mp3}', {}, ['test/fixtures/a.mp3']);
  await isMatch('test/fixtures/**/a.js', {}, [
    'test/fixtures/a.js',
    'test/fixtures/one/a.js',
    'test/fixtures/one/child/a.js'
  ]);

  await isMatch('test/fixtures/**/b.{js,txt}', {}, [
    'test/fixtures/b.js',
    'test/fixtures/b.txt',
    'test/fixtures/one/b.txt'
  ]);

  await isMatch('**/*.{txt,js}', { cwd }, [
    'a.js',
    'a.txt',
    'b.js',
    'b.txt',
    'ond/a.txt',
    'one/a.js',
    'one/a.txt',
    'one/b.txt',
    'one/child/a.js',
    'one/child/a.txt',
    'two/a.txt'
  ]);
});

test("glob: path dosen't exist (without glob)", async () => {
  await isMatch('z.js', { cwd }, [ ]);
});

test('glob: options.cwd', async () => {
  let dir = join(cwd, 'one', 'child');

  await isMatch('../*', { cwd:dir }, [
    '../a.js',
    '../a.md',
    '../a.txt',
    '../b.txt',
    '../child'
  ]);

  // Ideal: ../child/a.js etc
  await isMatch('../child/*', { cwd:dir }, [
    'a.js',
    'a.md',
    'a.txt'
  ]);
});

test('glob: options.cwd (without glob)', async () => {
  let dir = join(cwd, 'one', 'child');

  await isMatch('../child/a.js', { cwd:dir }, [ '../child/a.js' ]);
});

test('glob: options.cwd (absolute)', async () => {
  let dir = resolve(cwd, 'one', 'child');
  let opts = { cwd:dir, absolute:true };

  await isMatch('../*', opts, [
    resolve(dir, '../a.js'),
    resolve(dir, '../a.md'),
    resolve(dir, '../a.txt'),
    resolve(dir, '../b.txt'),
    resolve(dir)
  ]);

  // Ideal: ../child/a.js etc
  await isMatch('../child/*', opts, [
    resolve(dir, 'a.js'),
    resolve(dir, 'a.md'),
    resolve(dir, 'a.txt')
  ]);
});

test('glob: options.dot', async () => {
  await isMatch('test/fixtures/*.txt', { dot:true }, [
    'test/fixtures/.a-hidden.txt',
    'test/fixtures/a.txt',
    'test/fixtures/b.txt'
  ]);

  await isMatch('test/fixtures/*.txt', { dot:false }, [
    'test/fixtures/a.txt',
    'test/fixtures/b.txt'
  ]);
});

test('glob: options.absolute', async () => {
  await isMatch('test/fixtures/*.txt', { absolute:true }, [
    resolve('test/fixtures/a.txt'),
    resolve('test/fixtures/b.txt')
  ]);

  let dir = join(cwd, 'one', 'child');
  await isMatch('../*', { cwd:dir, absolute:true }, [
    resolve(dir, '../a.js'),
    resolve(dir, '../a.md'),
    resolve(dir, '../a.txt'),
    resolve(dir, '../b.txt'),
    resolve(dir)
  ]);
});

test('glob: options.absolute (without glob)', async () => {
  let dir = join(cwd, 'one', 'child');

  await isMatch('../child/a.js', { cwd:dir, absolute:true }, [
    resolve(dir, '../child/a.js')
  ]);
});

test('glob: options.filesOnly', async () => {
  await isMatch('test/fixtures/*', { filesOnly:true }, [
    //'test/fixtures/.a-hidden.txt',
    'test/fixtures/a.js',
    'test/fixtures/a.mp3',
    'test/fixtures/a.txt',
    'test/fixtures/b.js',
    'test/fixtures/b.txt'
  ]);

  await isMatch('test/fixtures/*', { filesOnly:false }, [
    'test/fixtures/a.js',
    'test/fixtures/a.mp3',
    'test/fixtures/a.txt',
    'test/fixtures/b.js',
    'test/fixtures/b.txt',
    'test/fixtures/deep',
    'test/fixtures/ond',
    'test/fixtures/one',
    'test/fixtures/two'
  ]);
});

test('glob: options.filesOnly (without glob)', async () => {
  await isMatch('test/fixtures/one', { filesOnly:true }, []);
  await isMatch('test/fixtures/one', { filesOnly:false }, [
    'test/fixtures/one',
  ]);
});

test('glob: deep match with higher level siblings', async () => {
  await isMatch('test/fixtures/deep/*/c/d', {}, [
    'test/fixtures/deep/b/c/d'
  ]);
});

test.run();
