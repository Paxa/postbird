var EventEmitter = require('events').EventEmitter

var test = require('tape')

var ConnectionPool = require('../')

test("Pool.query queues when no connections available", function (t) {
  t.plan(8)

  var connectionCount = 0
  var queryCount = 0
  var receivedQueries = 0

  var adapter = {
    // stub connections have an incrementing ID number that we can check to see
    // if queries are executed by the connection we expect.
    createConnection: function (_, callback) {
      var connection = {
        id: ++connectionCount,
        query: function (q) {
          t.equal(++receivedQueries, q.id, "query " + q.id + " executed in order")
          t.equal(q.expectedConnectionId, this.id, "query " + q.id + " used connection " + this.id)
          process.nextTick(function () { q.emit('end') })
        },
        end: function () {}
      }
      callback(null, connection)
    },

    // We abuse createQuery to pass in our expected connection ID for each query
    createQuery: function (connectionId) {
      var q = new EventEmitter
      q.id = ++queryCount
      q.expectedConnectionId = connectionId
      return q
    }
  }

  var pool = new ConnectionPool(adapter, "", {max: 2})

  // Instead of a query, we pass the expected connection id
  pool.query(1)
  pool.query(2)
  pool.query(1)
  pool.query(2)

  pool.close()
})
