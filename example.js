'use strict';

const { glob, isMatch, isValid } = require('./src');
const pattern = '**/*.js';
const opt = { cwd: 'test' };

(async function(){
    let list = await glob(pattern, opt)
    console.log(list)

    let match = await isMatch(pattern, opt);
    console.log(match)

    let valid = await isValid(pattern, 'foo/bar/hello.js');
    console.log(valid)
})().catch(console.log);
