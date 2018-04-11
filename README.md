# @robin/glob

> Fast micro glob-ish library to match files

Match files and folders using glob patterns, similar to how shell uses globbing.
All path are normalized compared to `node-glob`.

## Installation

```
npm install @robin/glob
```


## Usage

```js
const { glob } = require('@robin/glob');

(async function(){
    let files = await glob('src/*/*.{js,md}');
    // => [ ... ] array of matching files
})();
```


## API


### glob

Type: `function`<br>
Returns: `Array`

Return array of matching files and folders
This function is `async` and returns a promise.

#### str

Type: `String`

Glob string to seach for

#### options

Type: `Object`<br>
Default: `{ cwd: '.', hidden: false }`

Optional options object

#### options.cwd

Type: `String`<br>
Default: `'.'`

Change default working directory

#### options.hidden

Type: `Boolean`<br>
Default: `false`

Exclude hidden files

#### options.markdir

Type: `Boolean`<br>
Default: `false`

Mark directories by appending `path.sep`


### globSync

Type: `function`<br>
Returns: `Array`

Return array of matching files and folders

#### str

Type: `String`

Glob string to seach for

#### options

Type: `Object`<br>
Default: `{ cwd: '.', hidden: false }`

Optional options object

#### options.cwd

Type: `String`<br>
Default: `'.'`

Change default working directory

#### options.hidden

Type: `Boolean`<br>
Default: `false`

Exclude hidden files

#### options.markdir

Type: `Boolean`<br>
Default: `false`

Mark directories by appending `path.sep`


## License

MIT © [Terkel Gjervig](https://terkel.com)
