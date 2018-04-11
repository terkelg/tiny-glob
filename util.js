'use strict';

const test = require('tape');
const { join } = require('path');

const split = require('../src/util/split');
const markdir = require('../src/util/markdir');
const isglob = require('../src/util/isglob');

test('@robin/glob: util.split - path', t => {
    t.plan(82);

    t.equal(typeof split.path, 'function', 'consturctor is a typeof function');

    // should strip glob magic to return parent path
    t.equal(split.path('.'), '.');
    t.equal(split.path('.*'), '.');
    t.equal(split.path('/.*'), '/');
    t.equal(split.path('/.*/'), '/');
    t.equal(split.path('a/.*/b'), 'a');
    t.equal(split.path('a*/.*/b'), '.');
    t.equal(split.path('*/a/b/c'), '.');
    t.equal(split.path('*'), '.');
    t.equal(split.path('*/'), '.');
    t.equal(split.path('*/*'), '.');
    t.equal(split.path('*/*/'), '.');
    t.equal(split.path('**'), '.');
    t.equal(split.path('**/'), '.');
    t.equal(split.path('**/*'), '.');
    t.equal(split.path('**/*/'), '.');
    t.equal(split.path('/*.js'), '/');
    t.equal(split.path('*.js'), '.');
    t.equal(split.path('**/*.js'), '.');
    t.equal(split.path('{a,b}'), '.');
    t.equal(split.path('/{a,b}'), '/');
    t.equal(split.path('/{a,b}/'), '/');
    t.equal(split.path('(a|b)'), '.');
    t.equal(split.path('/(a|b)'), '/');
    t.equal(split.path('./(a|b)'), '.');
    t.equal(split.path('a/(b c)'), 'a', 'not an extglob');
    t.equal(split.path('a/(b c)/d'), 'a/(b c)', 'not an extglob');
    t.equal(split.path('path/to/*.js'), 'path/to');
    t.equal(split.path('/root/path/to/*.js'), '/root/path/to');
    t.equal(split.path('chapter/foo [bar]/'), 'chapter');
    t.equal(split.path('path/[a-z]'), 'path');
    t.equal(split.path('path/{to,from}'), 'path');
    t.equal(split.path('path/(to|from)'), 'path');
    t.equal(split.path('path/(foo bar)/subdir/foo.*'), 'path/(foo bar)/subdir');
    t.equal(split.path('path/!(to|from)'), 'path');
    t.equal(split.path('path/?(to|from)'), 'path');
    t.equal(split.path('path/+(to|from)'), 'path');
    t.equal(split.path('path/*(to|from)'), 'path');
    t.equal(split.path('path/@(to|from)'), 'path');
    t.equal(split.path('path/!/foo'), 'path/!');
    t.equal(split.path('path/?/foo'), 'path/?');
    t.equal(split.path('path/+/foo'), 'path/+');
    t.equal(split.path('path/*/foo'), 'path');
    t.equal(split.path('path/@/foo'), 'path/@');
    t.equal(split.path('path/!/foo/'), 'path/!/foo');
    t.equal(split.path('path/?/foo/'), 'path/?/foo');
    t.equal(split.path('path/+/foo/'), 'path/+/foo');
    t.equal(split.path('path/*/foo/'), 'path');
    t.equal(split.path('path/@/foo/'), 'path/@/foo');
    t.equal(split.path('path/**/*'), 'path');
    t.equal(split.path('path/**/subdir/foo.*'), 'path');
    t.equal(split.path('path/subdir/**/foo.js'), 'path/subdir');
    t.equal(split.path('path/!subdir/foo.js'), 'path/!subdir');

    // should respect escaped characters
    t.equal(split.path('path/\\*\\*/subdir/foo.*'), 'path/**/subdir');
    t.equal(split.path('path/\\[\\*\\]/subdir/foo.*'), 'path/[*]/subdir');
    t.equal(split.path('path/\\*(a|b)/subdir/foo.*'), 'path');
    t.equal(split.path('path/\\*/(a|b)/subdir/foo.*'), 'path/*');
    t.equal(split.path('path/\\*\\(a\\|b\\)/subdir/foo.*'), 'path/*(a|b)/subdir');
    t.equal(split.path('path/\\[foo bar\\]/subdir/foo.*'), 'path/[foo bar]/subdir');
    t.equal(split.path('path/\\[bar]/'), 'path/[bar]');
    t.equal(split.path('path/foo \\[bar]/'), 'path/foo [bar]');

    // should return parent dirname from non-glob paths
    t.equal(split.path('path'), '.');
    t.equal(split.path('path/foo'), 'path');
    t.equal(split.path('path/foo/'), 'path/foo');
    t.equal(split.path('path/foo/bar.js'), 'path/foo');
    t.equal(split.path('path'), '.');
    t.equal(split.path('path/foo'), 'path');
    t.equal(split.path('path/foo/'), 'path/foo');
    t.equal(split.path('path/foo/bar.js'), 'path/foo');

    // glob2base test patterns
    t.equal(split.path('js/*.js'), 'js');
    t.equal(split.path('js/**/test/*.js'), 'js');
    t.equal(split.path('js/test/wow.js'), 'js/test');
    t.equal(split.path('js/test/wow.js'), 'js/test');
    t.equal(split.path('js/t[a-z]st}/*.js'), 'js');
    t.equal(split.path('js/{src,test}/*.js'), 'js')
    t.equal(split.path('js/test{0..9}/*.js'), 'js')
    t.equal(split.path('js/t+(wo|est)/*.js'), 'js');
    t.equal(split.path('js/t(wo|est)/*.js'), 'js');
    t.equal(split.path('js/t/(wo|est)/*.js'), 'js/t');

    // should get a base name from a complex brace glob
    t.equal(split.path('lib/{components,pages}/**/{test,another}/*.txt'), 'lib');
    t.equal(split.path('js/test/**/{images,components}/*.js'), 'js/test');
    t.equal(split.path('ooga/{booga,sooga}/**/dooga/{eooga,fooga}'), 'ooga');
});

test('@robin/glob: util.split - glob', t => {
    t.plan(9);

    t.equal(typeof split.glob, 'function', 'consturctor is a typeof function');

    t.equal(split.glob(''), '');
    t.equal(split.glob('*'), '*');
    t.equal(split.glob('.*'), '.*');
    t.equal(split.glob('/.*'), '*');
    t.equal(split.glob('path/**/*'), '**/*');
    t.equal(split.glob('/path/**/*'), '**/*');
    t.equal(split.glob('root/(foo|bar)/path/**/*'), '(foo|bar)/path/**/*');
    t.equal(split.glob('@(test)/root/(foo|bar)/path/**/*'), '@(test)/root/(foo|bar)/path/**/*');
})

test('@robin/glob: util.markdir', t => {
    t.plan(11);

    t.equal(typeof markdir, 'function', 'consturctor is a typeof function');

    t.equal(markdir('.'), '.');
    t.equal(markdir('./'), './');
    t.equal(markdir('../'), '../');
    t.equal(markdir('hello'), 'hello/');
    t.equal(markdir('hello/'), 'hello/');
    t.equal(markdir('hello//'), 'hello//');
    t.equal(markdir('/hello/'), '/hello/');
    t.equal(markdir('/hello/'), '/hello/');
    t.equal(markdir('path/to/dir'), 'path/to/dir/');
    t.equal(markdir('path//to/dir'), 'path//to/dir/');
});

test('@robin/glob: util.isglob', t => {
    t.equal(typeof isglob, 'function', 'consturctor is a typeof function');

    // should be true if it is a glob pattern
    t.equal(isglob('*.js'), true);
    t.equal(isglob('!*.js'), true);
    t.equal(isglob('!foo'), true);
    t.equal(isglob('!foo.js'), true);
    t.equal(isglob('**/abc.js'), true);
    t.equal(isglob('abc/*.js'), true);
    t.equal(isglob('@.(?:abc)'), true);
    t.equal(isglob('@.(?!abc)'), true);

    // should not match escaped globs
    t.equal(!isglob('\\!\\*.js'), true);
    t.equal(!isglob('\\!foo'), true);
    t.equal(!isglob('\\!foo.js'), true);
    t.equal(!isglob('\\*(foo).js'), true);
    t.equal(!isglob('\\*.js'), true);
    t.equal(!isglob('\\*\\*/abc.js'), true);
    t.equal(!isglob('abc/\\*.js'), true);

    t.end();
});
