'use strict';

/* global describe: false */
/* global it: false */

/* jshint -W106 */
var COV = process.env.npm_lifecycle_event === 'coverage';
/* jshint +W106 */

var assert = require('assert')
  , path = require('path')
  , pgPass = require( path.join('..', COV ? 'lib-cov' : 'lib' , 'index') )
;


var conn = {
    'host'     : 'host4' ,
    'port'     : 100 ,
    'database' : 'database4' ,
    'user'     : 'user4'
};

describe('#1', function(){
    it('should handle escaping right', function(done){
        process.env.PGPASSFILE = path.join(__dirname, '_pgpass');
        pgPass(conn, function(res){
            assert.strictEqual('some:wired:password', res);
            done();
        });
    });
});
