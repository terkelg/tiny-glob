# tiny-glob

> Super fast and tiny glob library

Match files and folders using glob patterns, similar to how shell uses globbing.
"Globs" are the patterns you type when you do stuff like `ls *.js` in bash or put `src/*` in a .gitignore file.

## Install

```
npm install tiny-glob
```


## Core Features

- **ultra fast:** 223.40% faster than [node-glob](https://github.com/isaacs/node-glob) and 85.70% faster than [fast-glob](https://github.com/mrmlnc/fast-glob)
- **powerful:** supports advanced globbing patterns (`ExtGlob`)
- **tiny**: only ~70 LOC with only 2 small dependencies 


## Usage

```js
const glob = require('tiny-glob');

(async function(){
    let files = await glob('src/*/*.{js,md}');
    // => [ ... ] array of matching files
})();
```


## API


### tiny-glob

Type: `function`<br>
Returns: `Array`

Return array of matching files and folders
This function is `async` and returns a promise.

#### str

Type: `String`

The glob pattern to match against.

#### options.cwd

Type: `String`<br>
Default: `'.'`

Change default working directory.

#### options.dot

Type: `Boolean`<br>
Default: `false`

Allow patterns to match filenames or directories that begin with a period (`.`).

#### options.absolute

Type: `Boolean`<br>
Default: `false`

Return matches as absolute paths.

## Benchmarks

```
glob x 14,105 ops/sec ±1.10% (83 runs sampled)
fast-glob x 25,150 ops/sec ±0.93% (85 runs sampled)
tiny-glob x 95,175 ops/sec ±2.88% (77 runs sampled)
Fastest is tiny-glob
┌───────────┬─────────────────────────┬────────────┬────────────────┐
│ Name      │ Mean time               │ Ops/sec    │ Diff           │
├───────────┼─────────────────────────┼────────────┼────────────────┤
│ glob      │ 0.00007089650171219117  │ 14,105.068 │ N/A            │
├───────────┼─────────────────────────┼────────────┼────────────────┤
│ fast-glob │ 0.00003976069805950266  │ 25,150.464 │ 78.31% faster  │
├───────────┼─────────────────────────┼────────────┼────────────────┤
│ tiny-glob │ 0.000010506978453320642 │ 95,174.841 │ 278.42% faster │
└───────────┴─────────────────────────┴────────────┴────────────────┘
```

![I Am Glob](https://78.media.tumblr.com/3d4fc779600921f3c1e673181d78187e/tumblr_niltfqGoJt1qa0n48o1_500.gif) 

## License

MIT © [Terkel Gjervig](https://terkel.com)
