// https://github.com/grncdr/node-any-db-pool/issues/3

var test = require('tape')
var mockAdapter = require('any-db-fake')

var ConnectionPool = require('../')

test('pool close callback', {keepOpen: true}, function (t) {
  t.plan(3)

  var adapter = mockAdapter({
    connection: {
      end: function () { t.pass("Connection.end was called") }
    }
  })
  var pool = new ConnectionPool(adapter)

  pool.on('close', function () {
    t.pass('"close" was emitted')
  })

  pool.acquire(function (err, conn) {
    if (err) throw err
    pool.release(conn)
  })

  pool.close(function (err) {
    if (err) throw err
    t.pass('Pool close callback was called')
  })
})
