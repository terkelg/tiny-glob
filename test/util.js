const test = require('tape');
const { join } = require('path');
const $ = require('../src/util');

test('util', t => {
  t.equal(typeof $.toPath, 'function', 'constructor is a typeof function');
  t.equal(typeof $.toGlob, 'function', 'constructor is a typeof function');
  t.equal(typeof $.isGlob, 'function', 'constructor is a typeof function');
  t.end();
});

test('util.toPath', t => {
  let fn = $.toPath;

  [
    // should strip glob magic to return parent path
    ['.', '.'],
    ['.*', '.'],
    ['/.*', '/'],
    ['/.*/', '/'],
    ['a/.*/b', 'a'],
    ['a*/.*/b', '.'],
    ['*/a/b/c', '.'],
    ['*', '.'],
    ['*/', '.'],
    ['*/*', '.'],
    ['*/*/', '.'],
    ['**', '.'],
    ['**/', '.'],
    ['**/*', '.'],
    ['**/*/', '.'],
    ['/*.js', '/'],
    ['*.js', '.'],
    ['**/*.js', '.'],
    ['{a,b}', '.'],
    ['/{a,b}', '/'],
    ['/{a,b}/', '/'],
    ['(a|b)', '.'],
    ['/(a|b)', '/'],
    ['./(a|b)', '.'],
    ['a/(b c)', 'a', 'not an extglob'],
    ['a/(b c)/d', 'a/(b c)', 'not an extglob'],
    ['path/to/*.js', 'path/to'],
    ['/root/path/to/*.js', '/root/path/to'],
    ['chapter/foo [bar]/', 'chapter'],
    ['path/[a-z]', 'path'],
    ['path/{to,from}', 'path'],
    ['path/(to|from)', 'path'],
    ['path/(foo bar)/subdir/foo.*', 'path/(foo bar)/subdir'],
    ['path/!(to|from)', 'path'],
    ['path/?(to|from)', 'path'],
    ['path/+(to|from)', 'path'],
    ['path/*(to|from)', 'path'],
    ['path/@(to|from)', 'path'],
    ['path/!/foo', 'path/!'],
    ['path/?/foo', 'path/?'],
    ['path/+/foo', 'path/+'],
    ['path/*/foo', 'path'],
    ['path/@/foo', 'path/@'],
    ['path/!/foo/', 'path/!/foo'],
    ['path/?/foo/', 'path/?/foo'],
    ['path/+/foo/', 'path/+/foo'],
    ['path/*/foo/', 'path'],
    ['path/@/foo/', 'path/@/foo'],
    ['path/**/*', 'path'],
    ['path/**/subdir/foo.*', 'path'],
    ['path/subdir/**/foo.js', 'path/subdir'],
    ['path/!subdir/foo.js', 'path/!subdir'],
    // should respect escaped characters
    ['path/\\*\\*/subdir/foo.*', 'path/**/subdir'],
    ['path/\\[\\*\\]/subdir/foo.*', 'path/[*]/subdir'],
    ['path/\\*(a|b)/subdir/foo.*', 'path'],
    ['path/\\*/(a|b)/subdir/foo.*', 'path/*'],
    ['path/\\*\\(a\\|b\\)/subdir/foo.*', 'path/*(a|b)/subdir'],
    ['path/\\[foo bar\\]/subdir/foo.*', 'path/[foo bar]/subdir'],
    ['path/\\[bar]/', 'path/[bar]'],
    ['path/foo \\[bar]/', 'path/foo [bar]'],
    // should return parent dirname from non-glob paths
    ['path', '.'],,
    ['path/foo', 'path'],
    ['path/foo/', 'path/foo'],
    ['path/foo/bar.js', 'path/foo'],
    ['path', '.'],
    ['path/foo', 'path'],
    ['path/foo/', 'path/foo'],
    ['path/foo/bar.js', 'path/foo'],
    // glob2base test patterns
    ['js/*.js', 'js'],
    ['js/**/test/*.js', 'js'],
    ['js/test/wow.js', 'js/test'],
    ['js/test/wow.js', 'js/test'],
    ['js/t[a-z]st}/*.js', 'js'],
    ['js/{src,test}/*.js', 'js'],
    ['js/test{0..9}/*.js', 'js'],
    ['js/t+(wo|est)/*.js', 'js'],
    ['js/t(wo|est)/*.js', 'js'],
    ['js/t/(wo|est)/*.js', 'js/t'],
    // should get a base name from a complex brace glob
    ['lib/{components,pages}/**/{test,another}/*.txt', 'lib'],
    ['js/test/**/{images,components}/*.js', 'js/test'],
    ['ooga/{booga,sooga}/**/dooga/{eooga,fooga}', 'ooga']
  ].forEach(([x, y]) => {
    t.is(fn(x), y);
  });

  t.end();
});

test('util.toGlob', t => {
  let fn = $.toGlob;

  [
    ['', ''],
    ['*', '*'],
    ['.*', '.*'],
    ['/.*', '*'],
    ['path/**/*', '**/*'],
    ['/path/**/*', '**/*'],
    ['root/(foo|bar)/path/**/*', '(foo|bar)/path/**/*'],
    ['@(test)/root/(foo|bar)/path/**/*', '@(test)/root/(foo|bar)/path/**/*'],
  ].forEach(([x, y]) => {
    t.is(fn(x), y);
  });

  t.end();
})

test('util.isGlob', t => {
  let fn = $.isGlob;

  // should be true if it is a glob pattern
  ['*.js', '!*.js', '!foo', '!foo.js', '**/abc.js', 'abc/*.js', '@.(?:abc)', '@.(?!abc)'].forEach(x => {
    t.true(fn(x));
  });

  // should not match escaped globs
  ['\\!\\*.js', '\\!foo', '\\!foo.js', '\\*(foo).js', '\\*.js', '\\*\\*/abc.js', 'abc/\\*.js'].forEach(x => {
    t.false(fn(x));
  });

  t.end();
});
