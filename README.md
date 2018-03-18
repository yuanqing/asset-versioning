# asset-versioning [![npm Version](http://img.shields.io/npm/v/asset-versioning.svg?style=flat)](https://www.npmjs.org/package/asset-versioning) [![Build Status](https://img.shields.io/travis/yuanqing/asset-versioning.svg?branch=master&style=flat)](https://travis-ci.org/yuanqing/asset-versioning)

> [Version your assets](https://www.alainschlesser.com/bust-cache-content-hash/) by appending a hash to the filename.

## Usage

Using the CLI:

```sh
$ asset-versioning build 'css/**/*.css' 'js/**/*.js' --outputDirectory build | asset-versioning replace 'build/**/*'
```

Or equivalently, using the API:

```js
const assetVersioning = require('asset-versioning')

async function run () {
  const manifest = await assetVersioning.build(['css/**/*.css', 'js/**/*.js'], {
    outputDirectory: 'build'
  })
  assetVersioning.replace(['build/**/*'], manifest)
}
run()
```

## CLI

### Build

```
$ asset-versioning build --help

Usage: asset-versioning build [globs] [options]

Versions the files matched by globs. Writes a JSON object
mapping the original filenames to the versioned filenames to stdout.

Globs:
  One or more globs.

Options:
  -b, --baseDirectory BASE_DIRECTORY  Base directory to perform the
                                      globbing. Defaults to './'.
  -o, --outputDirectory OUTPUT_DIRECTORY  Directory to output the
                                          versioned files. Defaults
                                          to './build'.
  -h, --help  Print this message.

Example:
  asset-versioning build 'css/**/*.css' 'js/**/*.js' --outputDirectory build
```

### Replace

```
$ asset-versioning replace --help

Usage: asset-versioning replace [globs] [options]

Replaces original filenames with their versioned filenames (as
specified in a manifest) in the files matched by globs.

Globs:
  One or more globs. (Ignores binary files.)

Options:
  -b, --baseDirectory BASE_DIRECTORY  Base directory to perform the
                                      globbing. Defaults to './'.
  -m, --manifestFile MANIFEST_FILE  A JSON file mapping the original
                                    filenames to the versioned
                                    filenames. Read from stdin if
                                    this is not specified.
  -h, --help  Print this message.

Example:
  asset-versioning replace 'build/**/*' --manifestFile manifest.json
```

## API

```js
const assetVersioning = require('asset-versioning')
```

## assetVersioning.build(globs [, options])

Versions the files matched by `globs`. Returns a Promise for an object mapping the original filenames to the versioned filenames.

- `globs` is an array of one or more globs.
- `options` is an object literal:

    Key | Description | Default
    :--|:--|:--
    `baseDirectory` | Base directory to perform the globbing. | `process.cwd()`
    `outputDirectory` | Directory to output the versioned files. | `./build`

## assetVersioning.replace(globs, manifest [, options])

Replaces original filenames with their versioned filenames (as specified in the `manifest`) in the files matched by `globs`.

- `globs` is an array of one or more globs. (Ignores binary files.)
- `manifest` is an object mapping the original filenames to the versioned filenames.
- `options` is an object literal:

    Key | Description | Default
    :--|:--|:--
    `baseDirectory` | Base directory to perform the globbing. | `process.cwd()`

## Installation

Install via [yarn](https://yarnpkg.com):

```sh
$ yarn add --dev asset-versioning
```

Or [npm](https://npmjs.com):

```sh
$ npm install --save-dev asset-versioning
```

## License

[MIT](LICENSE.md)
