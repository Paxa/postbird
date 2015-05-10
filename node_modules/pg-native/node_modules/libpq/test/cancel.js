var Libpq = require('../');
var assert = require('assert');

describe('cancel a request', function() {
  it('works', function(done) {
    var pq = new Libpq();
    pq.connectSync();
    var sent = pq.sendQuery('pg_sleep(5000)');
    assert(sent, 'should have sent');
    var canceled = pq.cancel();
    assert.strictEqual(canceled, true, 'should have canceled');
    var hasResult = pq.getResult();
    assert(hasResult, 'should have a result');
    assert.equal(pq.resultStatus(), 'PGRES_FATAL_ERROR');
    assert.equal(pq.getResult(), false);
    pq.exec('SELECT NOW()');
    done();
  });
});
