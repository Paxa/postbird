/*!
 * RedScript compiler
 * v 0.0.1
 * Copyright(c) 2013 Adam Brodzinski <adambrodzinski@gmail.com>
 * MIT Licensed
 */


/**
 * Dependencies
 */

var fs  = require('fs')
  , compile = require('./compile')
  , cmd = require('../lib/cmdLine')
  , colors = require('colors')
  , opts =  cmd.getOptions(process.argv.slice(2));


/**
 * Takes a string filename as input, fetches the files contents
 * and calles the compile method on it. Once finished, it's saved to disk
 * in the same directory as the source file.
 *
 * @param  {string} filePath -- relative path to file
 * @api public
 */
module.exports = function(filePath) {
    var file, targetPath;

    // slice off file path and make it's extension .js
    targetPath = filePath.substring(0, filePath.lastIndexOf('.')) + '.js';
    
    // read file from filePath and pass into #compile
    file = compile(fs.readFileSync(filePath, 'utf-8'));

    // write out file to disk
    fs.writeFileSync(targetPath, file);

    // tell user
    if (opts.watchFiles)
        console.log(">>> Change detected on " + filePath);
    console.log("✔ Writing ".green + targetPath);
};
