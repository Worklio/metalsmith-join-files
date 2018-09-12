# metalsmith-join-files [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]
A metalsmith plugin to join all files in one file.

## Features

- join all files into one `index.html` with new metadata `files` - array of files  
- traverse all folders
- sort `files` array according specified metadata(s)

## Installation

```bash
$ npm install --save-dev metalsmith-join-files
```

## Usage

### Create article list and folders with sub parts of articles

```bash
[article 1]
 part 1.md
 part 2.md

[article 2]
 part 1.md
 part 2.md
 part 3.md

article 1.md
article 2.md
```

### Configure your build

```javascript
import metalsmithJoinFiles from 'metalsmith-join-files'

metalsmith.use(metalsmithJoinFiles({
  sortBy: 'order,title'
}))
```

### Options
#### sortBy
Coma separated list of metadata(s) according which will be sorted files in array

#### joinRoot = true
Join all files into one index.html file.

If it is set to `false` root files will be not joined. In each root file will be created array `files` with joined files from folder with the same name as root file.


[npm-image]: https://badge.fury.io/js/metalsmith-join-files.svg
[npm-url]: https://npmjs.org/package/metalsmith-join-files
[travis-image]: https://travis-ci.org/Worklio/metalsmith-join-files.svg?branch=master
[travis-url]: https://travis-ci.org/Worklio/metalsmith-join-files
