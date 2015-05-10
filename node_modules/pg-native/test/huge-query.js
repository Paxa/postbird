var Client = require('../')
var assert = require('assert')
var async = require('async')

describe('huge async query', function() {
  before(function(done) {
    this.client = Client();
    this.client.connect(done);
  });

  after(function(done) {
    this.client.end(done);
  });

  it('works', function(done) {
    var params = [''];
    var len = 100000;
    for(var i = 0; i < len; i++) {
      params[0] += 'A';
    }
    var qText = "SELECT '" + params[0] + "'::text as my_text";
    var start = Date.now();
    this.client.query(qText, function(err, rows) {
      if(err) return done(err);
      assert.equal(rows[0].my_text.length, len);
      done();
    });
    var end = Date.now();
  });
});
