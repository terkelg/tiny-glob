'use strict';

const glob = require('./src');
const pattern = '**!(node_modules)/*.js';

(async function(){
  let list = await glob(pattern);
  console.log(list);
})().catch(console.log);
