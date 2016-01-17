'use strict';

var path = require('path')
  , fs = require('fs')
  , helper = require( path.join(__dirname, 'helper.js') )
;


module.exports.warnTo = helper.warnTo;

module.exports = function(connInfo, cb) {
    var file = helper.getFileName();
    
    fs.stat(file, function(err, stat){
        if (err || !helper.usePgPass(stat, file)) {
            return cb(undefined);
        }

        var st = fs.createReadStream(file);

        helper.getPassword(connInfo, st, cb);
    });
};