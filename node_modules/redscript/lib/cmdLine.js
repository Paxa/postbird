/*!
 * RedScript compiler
 * v 0.0.1
 * Copyright(c) 2013 Adam Brodzinski <adambrodzinski@gmail.com>
 * MIT Licensed
 */

/**
 * Dependencies
 */
var colors = require('colors');

/**
 * Find options flags in argv
 * @param  {array} argList -- Pass in process.argV
 * @return {object} -- return options with boolean state
 * @api public
 */
exports.getOptions = function(argList){
    // default options
    var options = {
        watchFiles: false,
        moduleType: 'commonjs',
        aliases: true,
        insertSemiColons: true,
        classInsertion: true
    };

    argList.forEach(function(arg){
        switch (arg) {
        case 'watch':   // watch or -w or --watch, turn on watchFiles
        case '-w':
        case '--watch':
            options.watchFiles = true;
            break;
        case '--no-semicolon-comp': // turn off janky semicolon insertion
            options.insertSemiColons = false;
            break;
        case '--no-class-insertion': // turn off insertion of class methods
            options.classInsertion = false;
            break;
        default: // do nothing, it's a file (hopefully)
        }
    });

    return options;
};


/**
 * Filter through arguments and return only files. If the file
 * name does not have a .rs extension, an error is thrown.
 *
 * @param  {array} argList -- expecting from process.argv
 * @return {array}         -- list of files
 * @api public
 */
exports.getFiles = function(argList){
    var files = [];
    // filter through args and return only files
    argList.forEach(function(arg){
            // if it's a flag, fall through and do nothing
        if (arg === 'watch'
            || arg === '-w'
            || arg === '--watch'
            || arg === '--no-class-insertion') {
        } else {
            // it's a file, push to files array
            if (!/.+\.rs/i.test(arg))
                throw new Error("✖ expected an .rs file");
            files.push(arg);
        }
    });
    return files;
};

