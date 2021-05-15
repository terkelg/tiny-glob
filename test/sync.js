import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { join, resolve } from 'path';

import { order, unixify } from './helpers';
import glob from '../src/sync';

const cwd = join(__dirname, 'fixtures');

function isMatch(str, opts, arr) {
  arr = arr.map(unixify);
  let val = order(glob(str, opts));
  assert.equal(val, arr);
}

test('glob: standard', () => {
  assert.type(glob, 'function', 'consturctor is a typeof function');
  assert.instance(glob(''), Array, 'returns array');
});

test('glob: glob', () => {
  assert.equal(glob(''), []);
  assert.equal(glob('.'), ['.']);
  assert.equal(glob('./'), ['./']);

  isMatch('test/fixtures', {}, ['test/fixtures']);

  // Ideal: test/fixtures/../fixture etc
  isMatch('test/fixtures/../*', {}, [
    'test/async.js',
    'test/fixtures',
    'test/helpers',
    'test/sync.js',
  ]);

  isMatch('test/fixtures/*', {}, [
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

  isMatch('test/*.{js,txt}', {}, [
    'test/async.js',
    'test/sync.js',
  ]);

  isMatch('./test/*.{js,txt}', {}, [
    'test/async.js',
    'test/sync.js',
  ]);

  // Ideal: ../[parent]/test/fixtures/a.mp3
  isMatch('../tiny-glob/**/*.{mp3}', {}, ['test/fixtures/a.mp3']);

  isMatch('test/fixtures/**/*.{mp3}', {}, ['test/fixtures/a.mp3']);
  isMatch('tes[tp]/fixtures/**/*.{mp3}', {}, ['test/fixtures/a.mp3']);
  isMatch('test/fixtures/**/a.js', {}, [
    'test/fixtures/a.js',
    'test/fixtures/one/a.js',
    'test/fixtures/one/child/a.js'
  ]);

  isMatch('test/fixtures/**/b.{js,txt}', {}, [
    'test/fixtures/b.js',
    'test/fixtures/b.txt',
    'test/fixtures/one/b.txt'
  ]);

  isMatch('**/*.{txt,js}', { cwd }, [
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

test("glob: path dosen't exist (without glob)", () => {
  isMatch('z.js', { cwd }, [ ]);
});

test('glob: options.cwd', () => {
  let dir = join(cwd, 'one', 'child');

  isMatch('../*', { cwd:dir }, [
    '../a.js',
    '../a.md',
    '../a.txt',
    '../b.txt',
    '../child'
  ]);

  // Ideal: ../child/a.js etc
  isMatch('../child/*', { cwd:dir }, [
    'a.js',
    'a.md',
    'a.txt'
  ]);
});

test('glob: options.cwd (without glob)', () => {
  let dir = join(cwd, 'one', 'child');

  isMatch('../child/a.js', { cwd:dir }, [ '../child/a.js' ]);
});

test('glob: options.cwd (absolute)', () => {
  let dir = resolve(cwd, 'one', 'child');
  let opts = { cwd:dir, absolute:true };

  isMatch('../*', opts, [
    resolve(dir, '../a.js'),
    resolve(dir, '../a.md'),
    resolve(dir, '../a.txt'),
    resolve(dir, '../b.txt'),
    resolve(dir)
  ]);

  // Ideal: ../child/a.js etc
  isMatch('../child/*', opts, [
    resolve(dir, 'a.js'),
    resolve(dir, 'a.md'),
    resolve(dir, 'a.txt')
  ]);
});

test('glob: options.dot', () => {
  isMatch('test/fixtures/*.txt', { dot:true }, [
    'test/fixtures/.a-hidden.txt',
    'test/fixtures/a.txt',
    'test/fixtures/b.txt'
  ]);

  isMatch('test/fixtures/*.txt', { dot:false }, [
    'test/fixtures/a.txt',
    'test/fixtures/b.txt'
  ]);
});

test('glob: options.absolute', () => {
  isMatch('test/fixtures/*.txt', { absolute:true }, [
    resolve('test/fixtures/a.txt'),
    resolve('test/fixtures/b.txt')
  ]);

  let dir = join(cwd, 'one', 'child');
  isMatch('../*', { cwd:dir, absolute:true }, [
    resolve(dir, '../a.js'),
    resolve(dir, '../a.md'),
    resolve(dir, '../a.txt'),
    resolve(dir, '../b.txt'),
    resolve(dir)
  ]);
});

test('glob: options.absolute (without glob)', () => {
  let dir = join(cwd, 'one', 'child');

  isMatch('../child/a.js', { cwd:dir, absolute:true }, [
    resolve(dir, '../child/a.js')
  ]);
});

test('glob: options.filesOnly', () => {
  isMatch('test/fixtures/*', { filesOnly:true }, [
    //'test/fixtures/.a-hidden.txt',
    'test/fixtures/a.js',
    'test/fixtures/a.mp3',
    'test/fixtures/a.txt',
    'test/fixtures/b.js',
    'test/fixtures/b.txt'
  ]);

  isMatch('test/fixtures/*', { filesOnly:false }, [
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

test('glob: options.filesOnly (without glob)', () => {
  isMatch('test/fixtures/one', { filesOnly:true }, []);
  isMatch('test/fixtures/one', { filesOnly:false }, [
    'test/fixtures/one',
  ]);
});

test('glob: deep match with higher level siblings', () => {
  isMatch('test/fixtures/deep/*/c/d', {}, [
    'test/fixtures/deep/b/c/d'
  ]);
});

test.run();
