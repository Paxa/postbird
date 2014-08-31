var test = require('tape')
var mockAdapter = require('any-db-fake')

var ConnectionPool = require('../')

test("Pool query events", function (t) {
  var expected = 'SELECT 1';

  t.plan(1)

  var pool = new ConnectionPool(mockAdapter(), "")

  pool.on('query', function onQuery(query) {
    t.equal(query.text, expected, "emitted query")
  })

  pool.query(expected)

  pool.close()
})

test('queries from transactions are also emitted', function (t) {
  var pool = new ConnectionPool(mockAdapter(), "")

  var expected = [
    'BEGIN',
    'transaction query',
    'ROLLBACK'
  ]

  t.plan(expected.length)

  pool.on('query', function (q) {
    var e = expected.shift()
    t.equal(q.text, e, e)
    debugger
  })

  var tx = pool.begin()
  tx.query('transaction query')
  tx.rollback()
  pool.close()
})
