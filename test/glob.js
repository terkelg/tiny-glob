const test = require('tape');
const { join, resolve } = require('path');
const { order, unixify } = require('./helpers');
const glob = require('../');

const cwd = join(__dirname, 'fixtures');

function isMatch(t, str, opts, arr) {
  arr = arr.map(unixify);
  return glob(str, opts).then(order).then(val => {
    t.same(val, arr);
  });
}

test('glob: standard', async t => {
  t.plan(2);
  t.is(typeof glob, 'function', 'consturctor is a typeof function');
  t.true(Array.isArray(await glob('')), 'returns array');
});

test('glob: glob', async t => {
  t.plan(15);

  t.same(await glob(''), []);
  t.same(await glob('.'), ['.']);
  t.same(await glob('./'), ['./']);

  await isMatch(t, 'test/fixtures', {}, ['test/fixtures']);

  // Ideal: test/fixtures/../fixture etc
  await isMatch(t, 'test/fixtures/../*', {}, [
    'test/fixtures',
    'test/glob.js',
    'test/helpers'
  ]);

  await isMatch(t, '*', { cwd: __dirname }, [
    'fixtures',
    'glob.js',
    'helpers'
  ]);

  await isMatch(t, 'test/fixtures/*', {}, [
    'test/fixtures/a.js',
    'test/fixtures/a.mp3',
    'test/fixtures/a.txt',
    'test/fixtures/b.js',
    'test/fixtures/b.txt',
    'test/fixtures/ond',
    'test/fixtures/one',
    'test/fixtures/two'
  ]);

  await isMatch(t, 'test/*.{js,txt}', {}, [
    'test/glob.js'
  ]);

  await isMatch(t, './test/*.{js,txt}', {}, [
    'test/glob.js'
  ]);

  // Ideal: ../[parent]/test/fixtures/a.mp3
  await isMatch(t, '../tiny-glob/**/*.{mp3}', {}, ['test/fixtures/a.mp3']);

  await isMatch(t, 'test/fixtures/**/*.{mp3}', {}, ['test/fixtures/a.mp3']);
  await isMatch(t, 'tes[tp]/fixtures/**/*.{mp3}', {}, ['test/fixtures/a.mp3']);
  await isMatch(t, 'test/fixtures/**/a.js', {}, [
    'test/fixtures/a.js',
    'test/fixtures/one/a.js',
    'test/fixtures/one/child/a.js'
  ]);

  await isMatch(t, 'test/fixtures/**/b.{js,txt}', {}, [
    'test/fixtures/b.js',
    'test/fixtures/b.txt',
    'test/fixtures/one/b.txt'
  ]);

  await isMatch(t, '**/*.{txt,js}', { cwd }, [
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

test("glob: path dosen't exist (without glob)", async t => {
  t.plan(1);

  await isMatch(t, 'z.js', { cwd }, [ ]);
});

test('glob: options.cwd', async t => {
  t.plan(2);

  let dir = join(cwd, 'one', 'child');

  await isMatch(t, '../*', { cwd:dir }, [
    '../a.js',
    '../a.md',
    '../a.txt',
    '../b.txt',
    '../child'
  ]);

  // Ideal: ../child/a.js etc
  await isMatch(t, '../child/*', { cwd:dir }, [
    'a.js',
    'a.md',
    'a.txt'
  ]);
});

test('glob: options.cwd (without glob)', async t => {
  t.plan(1);

  let dir = join(cwd, 'one', 'child');

  await isMatch(t, '../child/a.js', { cwd:dir }, [ '../child/a.js' ]);
});

test('glob: options.cwd (absolute)', async t => {
  t.plan(2);

  let dir = resolve(cwd, 'one', 'child');
  let opts = { cwd:dir, absolute:true };

  await isMatch(t, '../*', opts, [
    resolve(dir, '../a.js'),
    resolve(dir, '../a.md'),
    resolve(dir, '../a.txt'),
    resolve(dir, '../b.txt'),
    resolve(dir)
  ]);

  // Ideal: ../child/a.js etc
  await isMatch(t, '../child/*', opts, [
    resolve(dir, 'a.js'),
    resolve(dir, 'a.md'),
    resolve(dir, 'a.txt')
  ]);
});

test('glob: options.dot', async t => {
  t.plan(2);

  await isMatch(t, 'test/fixtures/*.txt', { dot:true }, [
    'test/fixtures/.a-hidden.txt',
    'test/fixtures/a.txt',
    'test/fixtures/b.txt'
  ]);

  await isMatch(t, 'test/fixtures/*.txt', { dot:false }, [
    'test/fixtures/a.txt',
    'test/fixtures/b.txt'
  ]);
});

test('glob: options.absolute', async t => {
  t.plan(2);

  await isMatch(t, 'test/fixtures/*.txt', { absolute:true }, [
    resolve('test/fixtures/a.txt'),
    resolve('test/fixtures/b.txt')
  ]);

  let dir = join(cwd, 'one', 'child');
  await isMatch(t, '../*', { cwd:dir, absolute:true }, [
    resolve(dir, '../a.js'),
    resolve(dir, '../a.md'),
    resolve(dir, '../a.txt'),
    resolve(dir, '../b.txt'),
    resolve(dir)
  ]);
});

test('glob: options.absolute (without glob)', async t => {
  t.plan(1);

  let dir = join(cwd, 'one', 'child');

  await isMatch(t, '../child/a.js', { cwd:dir, absolute:true }, [
    resolve(dir, '../child/a.js')
  ]);
});

test('glob: options.filesOnly', async t => {
  t.plan(2);

  await isMatch(t, 'test/fixtures/*', { filesOnly:true }, [
    //'test/fixtures/.a-hidden.txt',
    'test/fixtures/a.js',
    'test/fixtures/a.mp3',
    'test/fixtures/a.txt',
    'test/fixtures/b.js',
    'test/fixtures/b.txt'
  ]);

  await isMatch(t, 'test/fixtures/*', { filesOnly:false }, [
    'test/fixtures/a.js',
    'test/fixtures/a.mp3',
    'test/fixtures/a.txt',
    'test/fixtures/b.js',
    'test/fixtures/b.txt',
    'test/fixtures/ond',
    'test/fixtures/one',
    'test/fixtures/two'
  ]);
});

test('glob: options.filesOnly (without glob)', async t => {
  t.plan(2);

  await isMatch(t, 'test/fixtures/one', { filesOnly:true }, []);

  await isMatch(t, 'test/fixtures/one', { filesOnly:false }, [
    'test/fixtures/one',
  ]);
});

test('glob: deep match with higher level siblings', async t => {
  t.plan(1);

  await isMatch(t, 'test/fixtures/deep/*/c/d', {}, [
    'test/fixtures/deep/b/c/d'
  ]);
});
