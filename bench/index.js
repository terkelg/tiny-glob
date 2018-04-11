const Table = require('cli-table2');
const { Suite } = require('benchmark');
const { sync } = require('glob');
const fg = require('fast-glob');
const curr = require('../src');

const cwd = __dirname;
const pattern = 'test/*.js';
const head = ['Name', 'Mean time', 'Ops/sec', 'Diff'];

new Suite({ onComplete })
  .add('glob', () => sync(pattern, { cwd }))
  .add('fast-glob', () => fg(pattern, { cwd }))
  .add('tiny-glob', () => curr(pattern, { cwd }))
  .on('cycle', e => console.log(String(e.target)))
  .run({ async:true });

function onComplete() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));

  let prev, diff;
  const tbl = new Table({ head });

  this.forEach(el => {
    diff = prev ? (((el.hz - prev) * 100 / prev).toFixed(2) + '% faster') : 'N/A';
    tbl.push([el.name, el.stats.mean, el.hz.toLocaleString(), diff])
    prev = el.hz;
  });
  console.log(tbl.toString());
}
