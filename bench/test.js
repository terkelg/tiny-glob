'use strict';

const glob = require('../src');

const nodeGlob = require('glob');
const fastGlob = require('fast-glob'); 

const pattern = '../test/*.js';
const opt = { cwd: 'test' };

(async function(){

    /**
     * Make sure I get the same results as node-glob.
     * Test really complex globs.
     * Test cwd option and strange paths (../tests/../ shit)
     * Test on windows
     */

    let list = await glob(pattern, opt)
    console.log(list)

    list = await fastGlob(pattern, opt);
    console.log(list);

    nodeGlob(pattern, opt, (er, files) => {
      console.log(files);
    });


})().catch(console.log);
