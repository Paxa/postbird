var path = require('path');
var fs = require('fs');

var CliUtil = {
  resolveArg(url, callback) {
    var parts = url.split('#WORKING_DIR=');
    var workingDir = null;
    if (parts.length == 2) {
      url = parts[0];
      workingDir = parts[1];
    }

    console.log('CliUtil.resolveArg', url, workingDir);

    if (workingDir) {
      this.checkFiles(url, workingDir, callback);
    } else {
      callback(url);
    }

  },

  checkFiles(url, workingDir, callback) {
    var joinedPath = path.join(workingDir, url.replace('postgres://', ''));
    console.log("ckecking if exist", joinedPath);
    fs.access(joinedPath, 'r', (err) => {
      if (err) {
        console.log(joinedPath, 'not exists');
        callback(url);
      } else {
        this.tryFindConfig(joinedPath, (result) => {
          callback(result || url);
        });
        //this.tryFindConfig(workingDir, callback);
      }
    });
  },

  tryFindConfig(folder, callback) {
    var file = path.join(folder, '.postbird');
    console.log("ckecking if exist", file);
    fs.access(file, 'r', (err) => {
      if (err) {
        callback(false);
      } else {
        this.loadDotPostbird(file, callback);
      }
    });
  },

  loadDotPostbird(path, callback) {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) throw err;
      var fileData = data.toString().trim();
      if (fileData[0] == "{") {
        data = JSON.parse(fileData);
        callback(data.default);
      } else {
        data = require(path);
        callback(data.default);
      }
    });
  }
  // nativeObject = YAML.parse(yamlString);
};

module.exports = CliUtil;
