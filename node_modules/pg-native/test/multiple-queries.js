var Client = require('../');
var assert = require('assert');

describe('multiple commands in a single query', function() {
  before(function(done) {
    this.client = new Client()
    this.client.connect(done)
  })

  after(function(done) {
    this.client.end(done)
  })

  it('all execute to completion', function(done) {
    this.client.query("SELECT '10'::int as num; SELECT 'brian'::text as name", function(err, rows) {
      assert.ifError(err);
      assert.equal(rows.length, 2, 'should return two rows');
      assert.equal(rows[0].num, '10');
      assert.equal(rows[1].name, 'brian');
      done();
    });
  });

  it('inserts and reads at once', function(done) {
    var txt = 'CREATE TEMP TABLE boom(age int);';
    txt += 'INSERT INTO boom(age) VALUES(10);';
    txt += 'SELECT * FROM boom;';
    this.client.query(txt, function(err, rows) {
      assert.ifError(err);
      assert.equal(rows.length, 1);
      assert.equal(rows[0].age, 10);
      done();
    });
  });
});
