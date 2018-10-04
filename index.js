'use strict'

const nodePath = require('path');

/**
   * A metalsmith plugin to join all files in one file.
   * @param {object} [options] - Options
   * @param {string} [options.sortBy] - Coma separated list of metadata(s) according which will be sorted files in array
   * @param {boolean} [options.joinRoot=true] - Join all files into one index.html file. If it is set to `false` root files will be not joined. In each root file will be created array `files` with joined files from folder with the same name as root file.
   * @param {string} [options.rootFileName="index.html"] - Name of new file with joined all files.
   **/

module.exports = function(options = {}) {
  var sortBy = (options.sortBy||"").split(",");
  var joinRoot = options.joinRoot === undefined ? true : options.joinRoot;
  var rootFileName = options.rootFileName || "index.html";

  return ((files, metalsmith, done) => {
    let directoryTree = {files:[]};

    Object.keys(files).forEach(function(file){
      let ext = nodePath.extname(file);
      let filePathWithouExt = file.substring(0, file.lastIndexOf('.'));
      let path = filePathWithouExt.split(/\/|\\|\\\\/);
      let level = 0;

      if(joinRoot || path.length > 1) {
        let target;
        if(joinRoot) 
          target = directoryTree;

        path.forEach(function(segment){
          if(!joinRoot && level == 0) {
            let parentFileName = segment+ext;
            target = files[parentFileName];

            if(target === undefined) {
              files[parentFileName] = {
                contents: Buffer.from("", "utf8")
              };
              target = files[parentFileName];
            }
              
            level++;
            return;
          }


          if(target.files === undefined) target.files = [];

          if(target.files[segment] === undefined){
            target.files[segment] = {
              files:[],
              content: {
                contents: Buffer.from("", "utf8")
              }
            }
          }
          target = target.files[segment];
          level++;
        });

      
        target.content = files[file];
        target.content.fileName = file;
        delete files[file];
      }
      else {
        if(files[file].files === undefined) files[file].files = [];
      }

    });

    let compare = (a, b) => {
      var index = 0;
      while (a[sortBy[index]]!=b[sortBy[index]] && index>sortBy.length-1) {
        index++;
      }

      return a[sortBy[index]]==b[sortBy[index]] ? 0 : a[sortBy[index]]<b[sortBy[index]] ? -1 : 1;
    };

    let flat = (fileName, parent, target) => {
      let file = parent[fileName];
      let files = file.files;

      let flatFile = file.content || {
        title: fileName
      };
      flatFile.files = [];

      if(files) {
        Object.keys(files).forEach( (file) => { flat(file, files, flatFile.files) });
        if(sortBy.length) 
          flatFile.files.sort(compare);
      }

      target.push(flatFile);
    };


    if(joinRoot) {
      let orderedDirectoryTree = [];

      Object.keys(directoryTree.files).forEach((file) => { flat(file, directoryTree.files, orderedDirectoryTree) });
      orderedDirectoryTree.sort(compare);
    
      files[rootFileName] = {
        files: orderedDirectoryTree,
        contents: Buffer.from("", "utf8")
      };
    }
    else {
      Object.keys(files).forEach(function(rootFileName){
        let rootFile = files[rootFileName];

        let orderedDirectoryTree = [];
        Object.keys(rootFile.files).forEach((file) => {flat(file, rootFile.files, orderedDirectoryTree) });
        orderedDirectoryTree.sort(compare);

        rootFile.files = orderedDirectoryTree;
      })
    }


    done();
  })
}
