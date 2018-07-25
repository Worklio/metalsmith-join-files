'use strict'

//const path = require('path');

module.exports = (options = {}) => ((files, metalsmith, done) => {
  
  let directoryTree = {files:[]};

  Object.keys(files).forEach(function(file){
    let filePathWithouExt = file.substring(0, file.lastIndexOf('.'));
    let path = filePathWithouExt.split('/');
    let level = 0;
    let target = directoryTree;

    path.forEach(function(segment){
      if(target.files[segment] === undefined){
        target.files[segment] = {
          files:[]
        }
      }
      target = target.files[segment];
      level++;
    });
    
    target.content = files[file];

    delete files[file];
  });

  let orderedDirectoryTree = [];
  let flat = (fileName, parent, target) => {
    let file = parent[fileName];
    let files = file.files;

    let flatFile = file.content || {
      title: fileName
    };
    flatFile.files = [];

    if(files)
      Object.keys(files).forEach( (file) => { flat(file, files, flatFile.files) });

    target.push(flatFile);
  };

  Object.keys(directoryTree.files).forEach((file) => { flat(file, directoryTree.files, orderedDirectoryTree) });
  

  files['index.html'] = {
    files: orderedDirectoryTree,
    contents: new Buffer("")
  };

  done();
})
