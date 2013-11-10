var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var os = require('os');

var cloned = module.exports = function(sha, cb) {
  var moduleDir = path.join(cloned.workingDir, sha);
  var options = { cwd: moduleDir };
  var source = '.';
  //support remote repositories
  if(sha.indexOf('@') > 0) {
    var splits = sha.split('@');
    source = splits[0];
    sha = splits[1];
  }
  exec('git clone ' + source + ' ' + moduleDir, function(err, stdout, stderr) {
    if(err) return cb(err, null);
    exec('git checkout ' + sha, options, function(err, stdout, stderr) {
      if(err) return cb(err, null);
      fs.exists(moduleDir + '/package.json', function(exists) {
        if(exists) {
          exec('npm install', options, function(err, stdout, stderr) {
            if(err) return cb(err, null);
            cb(null, moduleDir);
          });
        } else {
          cb(null, moduleDir);
        }
      });
    });
  });
};

cloned.workingDir = require('os').tmpDir();

//returns the current sha of the module
//only used in testing
cloned._getCurrentSha = function(cb) {
  exec('git log --max-count=1 --format=%h', {cwd: __dirname}, function(err, stdout) {
    if(err) return cb(err);
    return cb(null, stdout.trim());
  });
};
