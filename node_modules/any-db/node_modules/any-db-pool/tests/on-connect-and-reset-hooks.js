var test = require('tape')
var ConnectionPool = require('../')

test('ConnectionPool onConnect/reset hooks', function (t) {
  // Create a pool with 2 connections maximum.
  // each connection will be initialized once and reset twice
  t.plan(6)
  var connectCount = 2, resetCount = 4

  var adapter = {
    createConnection: function (_, cb) { cb(null, {end: function () {}}) }
  }

  var pool = new ConnectionPool(adapter, "", {
    max: 2,
    onConnect: function (conn, ready) {
      t.ok(connectCount-- > 0, 'onConnect called')
      ready(null, conn)
    },
    reset: function (conn, ready) {
      t.ok(resetCount-- > 0, 'reset called')
      ready()
    }
  })

  ;[1, 2, 3, 4].forEach(function () {
    pool.acquire(function (err, conn) {
      process.nextTick(pool.release.bind(pool, conn))
    })
  })

  pool.close()
})
