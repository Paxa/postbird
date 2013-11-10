/*!
 * rmdir
 * Copyright(c) 2012 Ben Lin <ben@dreamerslab.com>
 * MIT Licensed
 *
 * @fileoverview
 * Remove all files in the given path recursively.
 */
var fs = require( 'fs' );

function rmdir( dir, callback ){
  fs.stat( dir, function ( err, stat ){
    var is_dir = stat && stat.isDirectory();
    var _dir   = is_dir ? dir + '/' : dir;
    var _files = [];
    var _dirs  = [];

    if( !is_dir ){
      fs.unlinkSync( _dir );
      return callback( null, _dirs, _files );
    }

    fs.readdir( _dir, function ( err, files ){
      var pending;

      if( err ) return callback( err );

      pending = files.length;

      _dirs.push( _dir );

      if( !pending ){
        fs.rmdirSync( _dir );
        return callback( null, _dirs, _files );
      }

      files.forEach( function ( file ){
        file = _dir + file;

        fs.stat( file, function ( err, stat ){
          if( stat && stat.isDirectory()){
            _dirs.push( file );

            rmdir( file, function ( err, dirs, files ){
              _files = _files.concat( files );

              if( !--pending ){
                _dirs.forEach( function ( dir ){
                  if( fs.existsSync( dir )){
                    fs.rmdirSync( dir );
                  }
                });
                callback( null, _dirs, _files );
              }
            });

            return;
          }

          _files.push( file );
          fs.unlinkSync( file );

          if( !--pending ){
            _dirs.forEach( function ( dir ){
              if( fs.existsSync( dir )){
                fs.rmdirSync( dir );
              }
            });
            callback( null, _dirs, _files );
          }
        });
      });
    });
  });
};

/**
 * @public
 */
rmdir.version = JSON.parse(
  fs.readFileSync( __dirname + '/../package.json', 'utf8' )
).version;

/**
 * Exports module.
 */
module.exports = rmdir;