'use strict';

/* global describe: false */
/* global it: false */
/* global after: false */
/* global before: false */

/* jshint -W106 */
var COV = process.env.npm_lifecycle_event === 'coverage';
/* jshint +W106 */

var assert = require('assert')
  , path = require('path')
  , pgPass = require( path.join('..', COV ? 'lib-cov' : 'lib' , 'index') )
;


var conn = {
    'host'     : 'host5' ,
    'database' : 'database5' ,
    'user'     : 'dummy\\:user'
};

describe('#1', function(){
	before(function(){
		process.env.PGPASS_NO_DEESCAPE = true;
        process.env.PGPASSFILE = path.join(__dirname, '_pgpass');
	});
	after(function(){
		delete process.env.PGPASS_NO_DEESCAPE;
		delete process.env.PGPASSFILE;
	});

    it('should not de-escape NODE_PG_NO_DESCAPE is set', function(done){
        process.env.PGPASSFILE = path.join(__dirname, '_pgpass');

        pgPass(conn, function(res){
            assert.strictEqual('some:password', res);
            done();
        });
    });
});
