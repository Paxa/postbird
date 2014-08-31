var test = require('tape')
var ConnectionPool = require('../')

test('Connection errors in a pool are forwarded to query callbacks', function (t) {
  // A stub adapter that errors on connect
  var adapter = {
    createQuery: function () { },
    createConnection: function (_, callback) { callback(new Error("Blammo")) }
  }

  var pool = new ConnectionPool(adapter, "no-url", {min: 0})

  t.plan(4);

  pool.query('This is not valid SQL', function(err) {
    t.assert(err, "Error should be passed to callback when there are no params")
    t.equal('Blammo', err.message, "Got expected error")
  });

  pool.query('This is not valid SQL', [], function(err) {
    t.assert(err, "Error should be passed to callback when there are params")
    t.equal('Blammo', err.message, "Got expected error")
  });

  t.on('end', pool.close.bind(pool))
});
