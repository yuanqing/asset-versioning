# asset-versioning [![npm Version](http://img.shields.io/npm/v/asset-versioning.svg?style=flat)](https://www.npmjs.org/package/asset-versioning) [![Build Status](https://img.shields.io/travis/yuanqing/asset-versioning.svg?branch=master&style=flat)](https://travis-ci.org/yuanqing/asset-versioning) [![Coverage Status](https://img.shields.io/coveralls/yuanqing/asset-versioning.svg?style=flat)](https://coveralls.io/r/yuanqing/asset-versioning)

> Version your assets by appending a hash to the filename.

## Usage

```sh
$ asset-versioning build 'css/*.css' 'js/*.js' --output build | asset-versioning replace 'build/**/*'
```

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
