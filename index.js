'use strict'

module.exports = function(options = {}) {
  var sortBy = (options.sortBy||"").split(",");
  var joinRoot = options.joinRoot === undefined ? true : options.joinRoot;

  return ((files, metalsmith, done) => {
    
    let directoryTree = {};

    Object.keys(files).forEach(function(file){
      let filePathWithouExt = file.substring(0, file.lastIndexOf('.'));
      let path = filePathWithouExt.split(/\/|\\|\\\\/);
      let level = 0;

      if(joinRoot || path.length > 1) {
        let target;
        if(joinRoot) 
          target = directoryTree;

        path.forEach(function(segment){
          if(!joinRoot && level == 0) {
            target = files[segment+'.html'];
            level++;
            return;
          }

          if(target.files === undefined) target.files = [];

          if(target.files[segment] === undefined){
            target.files[segment] = {
              files:[]
            }
          }
          target = target.files[segment];
          level++;
        });
      
        target.content = files[file];
        target.content.fileName = file;
        delete files[file];
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
    
      files['index.html'] = {
        files: orderedDirectoryTree,
        contents: new Buffer("")
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
