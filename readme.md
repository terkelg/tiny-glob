<div align="center">
  <img src="https://github.com/terkelg/tiny-glob/raw/master/tiny-glob.png" alt="Tiny Glob" width="500" height="320" />
</div>

<h1 align="center">Tiny Glob</h1>

<div align="center">
  <a href="https://npmjs.org/package/tiny-glob">
    <img src="https://img.shields.io/npm/v/tiny-glob.svg" alt="version" />
  </a>
  <a href="https://travis-ci.org/terkelg/tiny-glob">
    <img src="https://img.shields.io/travis/terkelg/tiny-glob.svg" alt="travis" />
  </a>
  <a href="https://npmjs.org/package/tiny-glob">
    <img src="https://img.shields.io/npm/dm/tiny-glob.svg" alt="downloads" />
  </a>
</div>

<div align="center">Tiny and super fast library to matches files and folders using glob patterns.</div>

<br />


"Globs" is the common name for a specific type of pattern used to match files and folders. It's the patterns you type when you do stuff like `ls *.js` in your shell or put `src/*` in a `.gitignore` file. When used to match filenames, it's sometimes called a "wildcard".


## Install

```
npm install tiny-glob
```


## Core Features

- 🔥 **ultra fast:** ~250% faster than [node-glob](https://github.com/isaacs/node-glob) and 85.70% faster than [fast-glob](https://github.com/mrmlnc/fast-glob)
- 💪 **powerful:** supports advanced globbing patterns (`ExtGlob`)
- 📦 **tiny**: only ~70 LOC with only 2 small dependencies
- 👫 **friendly**: simple and easy to use api 


## Usage

```js
const glob = require('tiny-glob');

(async function(){
    let files = await glob('src/*/*.{js,md}');
    // => [ ... ] array of matching files
})();
```


## API


### glob(str, options)

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

#### options.filesOnly

Type: `Boolean`<br>
Default: `false`

Skip directories and return matched files only.

## Benchmarks

```
glob x 14,171 ops/sec ±0.84% (84 runs sampled)
fast-glob x 25,996 ops/sec ±1.57% (85 runs sampled)
tiny-glob x 91,406 ops/sec ±4.29% (81 runs sampled)
Fastest is tiny-glob
┌───────────┬─────────────────────────┬────────────┬────────────────┐
│ Name      | Mean time               │ Ops/sec    │ Diff           │
├───────────┼─────────────────────────┼────────────┼────────────────┤
│ glob      | 0.00007056743443261285  │ 14,170.843 │ N/A            │
├───────────┼─────────────────────────┼────────────┼────────────────┤
│ fast-glob │ 0.00003846778050833284  │ 25,995.781 │ 83.45% faster  │
├───────────┼─────────────────────────┼────────────┼────────────────┤
│ tiny-glob │ 0.000010940155968612903 | 91,406.375 │ 251.62% faster │
└───────────┴─────────────────────────┴────────────┴────────────────┘
```

## Advanced Globbing

Learn more about advanced globbing

 - [](https://mywiki.wooledge.org/glob) 
 - [Bash Extended Globbing](https://www.linuxjournal.com/content/bash-extended-globbing)

---

![I Am Glob](https://78.media.tumblr.com/3d4fc779600921f3c1e673181d78187e/tumblr_niltfqGoJt1qa0n48o1_500.gif) 

## License

MIT © [Terkel Gjervig](https://terkel.com)
