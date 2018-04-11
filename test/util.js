const test = require('tape');
const { join } = require('path');
const $ = require('../src/util');

test('util.split - path', t => {
  t.plan(82);

  t.equal(typeof $.toPath, 'function', 'constructor is a typeof function');

  // should strip glob magic to return parent path
  t.equal($.toPath('.'), '.');
  t.equal($.toPath('.*'), '.');
  t.equal($.toPath('/.*'), '/');
  t.equal($.toPath('/.*/'), '/');
  t.equal($.toPath('a/.*/b'), 'a');
  t.equal($.toPath('a*/.*/b'), '.');
  t.equal($.toPath('*/a/b/c'), '.');
  t.equal($.toPath('*'), '.');
  t.equal($.toPath('*/'), '.');
  t.equal($.toPath('*/*'), '.');
  t.equal($.toPath('*/*/'), '.');
  t.equal($.toPath('**'), '.');
  t.equal($.toPath('**/'), '.');
  t.equal($.toPath('**/*'), '.');
  t.equal($.toPath('**/*/'), '.');
  t.equal($.toPath('/*.js'), '/');
  t.equal($.toPath('*.js'), '.');
  t.equal($.toPath('**/*.js'), '.');
  t.equal($.toPath('{a,b}'), '.');
  t.equal($.toPath('/{a,b}'), '/');
  t.equal($.toPath('/{a,b}/'), '/');
  t.equal($.toPath('(a|b)'), '.');
  t.equal($.toPath('/(a|b)'), '/');
  t.equal($.toPath('./(a|b)'), '.');
  t.equal($.toPath('a/(b c)'), 'a', 'not an extglob');
  t.equal($.toPath('a/(b c)/d'), 'a/(b c)', 'not an extglob');
  t.equal($.toPath('path/to/*.js'), 'path/to');
  t.equal($.toPath('/root/path/to/*.js'), '/root/path/to');
  t.equal($.toPath('chapter/foo [bar]/'), 'chapter');
  t.equal($.toPath('path/[a-z]'), 'path');
  t.equal($.toPath('path/{to,from}'), 'path');
  t.equal($.toPath('path/(to|from)'), 'path');
  t.equal($.toPath('path/(foo bar)/subdir/foo.*'), 'path/(foo bar)/subdir');
  t.equal($.toPath('path/!(to|from)'), 'path');
  t.equal($.toPath('path/?(to|from)'), 'path');
  t.equal($.toPath('path/+(to|from)'), 'path');
  t.equal($.toPath('path/*(to|from)'), 'path');
  t.equal($.toPath('path/@(to|from)'), 'path');
  t.equal($.toPath('path/!/foo'), 'path/!');
  t.equal($.toPath('path/?/foo'), 'path/?');
  t.equal($.toPath('path/+/foo'), 'path/+');
  t.equal($.toPath('path/*/foo'), 'path');
  t.equal($.toPath('path/@/foo'), 'path/@');
  t.equal($.toPath('path/!/foo/'), 'path/!/foo');
  t.equal($.toPath('path/?/foo/'), 'path/?/foo');
  t.equal($.toPath('path/+/foo/'), 'path/+/foo');
  t.equal($.toPath('path/*/foo/'), 'path');
  t.equal($.toPath('path/@/foo/'), 'path/@/foo');
  t.equal($.toPath('path/**/*'), 'path');
  t.equal($.toPath('path/**/subdir/foo.*'), 'path');
  t.equal($.toPath('path/subdir/**/foo.js'), 'path/subdir');
  t.equal($.toPath('path/!subdir/foo.js'), 'path/!subdir');

  // should respect escaped characters
  t.equal($.toPath('path/\\*\\*/subdir/foo.*'), 'path/**/subdir');
  t.equal($.toPath('path/\\[\\*\\]/subdir/foo.*'), 'path/[*]/subdir');
  t.equal($.toPath('path/\\*(a|b)/subdir/foo.*'), 'path');
  t.equal($.toPath('path/\\*/(a|b)/subdir/foo.*'), 'path/*');
  t.equal($.toPath('path/\\*\\(a\\|b\\)/subdir/foo.*'), 'path/*(a|b)/subdir');
  t.equal($.toPath('path/\\[foo bar\\]/subdir/foo.*'), 'path/[foo bar]/subdir');
  t.equal($.toPath('path/\\[bar]/'), 'path/[bar]');
  t.equal($.toPath('path/foo \\[bar]/'), 'path/foo [bar]');

  // should return parent dirname from non-glob paths
  t.equal($.toPath('path'), '.');
  t.equal($.toPath('path/foo'), 'path');
  t.equal($.toPath('path/foo/'), 'path/foo');
  t.equal($.toPath('path/foo/bar.js'), 'path/foo');
  t.equal($.toPath('path'), '.');
  t.equal($.toPath('path/foo'), 'path');
  t.equal($.toPath('path/foo/'), 'path/foo');
  t.equal($.toPath('path/foo/bar.js'), 'path/foo');

  // glob2base test patterns
  t.equal($.toPath('js/*.js'), 'js');
  t.equal($.toPath('js/**/test/*.js'), 'js');
  t.equal($.toPath('js/test/wow.js'), 'js/test');
  t.equal($.toPath('js/test/wow.js'), 'js/test');
  t.equal($.toPath('js/t[a-z]st}/*.js'), 'js');
  t.equal($.toPath('js/{src,test}/*.js'), 'js')
  t.equal($.toPath('js/test{0..9}/*.js'), 'js')
  t.equal($.toPath('js/t+(wo|est)/*.js'), 'js');
  t.equal($.toPath('js/t(wo|est)/*.js'), 'js');
  t.equal($.toPath('js/t/(wo|est)/*.js'), 'js/t');

  // should get a base name from a complex brace glob
  t.equal($.toPath('lib/{components,pages}/**/{test,another}/*.txt'), 'lib');
  t.equal($.toPath('js/test/**/{images,components}/*.js'), 'js/test');
  t.equal($.toPath('ooga/{booga,sooga}/**/dooga/{eooga,fooga}'), 'ooga');
});

test('util.split - glob', t => {
  t.plan(9);

  t.equal(typeof $.toGlob, 'function', 'constructor is a typeof function');

  t.equal($.toGlob(''), '');
  t.equal($.toGlob('*'), '*');
  t.equal($.toGlob('.*'), '.*');
  t.equal($.toGlob('/.*'), '*');
  t.equal($.toGlob('path/**/*'), '**/*');
  t.equal($.toGlob('/path/**/*'), '**/*');
  t.equal($.toGlob('root/(foo|bar)/path/**/*'), '(foo|bar)/path/**/*');
  t.equal($.toGlob('@(test)/root/(foo|bar)/path/**/*'), '@(test)/root/(foo|bar)/path/**/*');
})

test('util.$.isGlob', t => {
  t.equal(typeof $.isGlob, 'function', 'constructor is a typeof function');

  // should be true if it is a glob pattern
  t.equal($.isGlob('*.js'), true);
  t.equal($.isGlob('!*.js'), true);
  t.equal($.isGlob('!foo'), true);
  t.equal($.isGlob('!foo.js'), true);
  t.equal($.isGlob('**/abc.js'), true);
  t.equal($.isGlob('abc/*.js'), true);
  t.equal($.isGlob('@.(?:abc)'), true);
  t.equal($.isGlob('@.(?!abc)'), true);

  // should not match escaped globs
  t.equal(!$.isGlob('\\!\\*.js'), true);
  t.equal(!$.isGlob('\\!foo'), true);
  t.equal(!$.isGlob('\\!foo.js'), true);
  t.equal(!$.isGlob('\\*(foo).js'), true);
  t.equal(!$.isGlob('\\*.js'), true);
  t.equal(!$.isGlob('\\*\\*/abc.js'), true);
  t.equal(!$.isGlob('abc/\\*.js'), true);

  t.end();
});
