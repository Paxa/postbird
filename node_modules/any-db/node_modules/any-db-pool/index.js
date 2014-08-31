var inherits     = require('util').inherits
var EventEmitter = require('events').EventEmitter
var Transaction  = require('any-db-transaction')
var Pool         = require('generic-pool').Pool
var once         = require('once')
var chain        = require('./lib/chain')

module.exports = ConnectionPool

inherits(ConnectionPool, EventEmitter)

function ConnectionPool(adapter, connParams, options) {
  if (!(this instanceof ConnectionPool)) {
    return new ConnectionPool(adapter, connParams, options)
  }
  EventEmitter.call(this)

  options    = options    || {}
  connParams = connParams || {}

  if (options.create || options.destroy) {
    throw new Error("Use onConnect/reset options instead of create/destroy.")
  }

  if (connParams.adapter == 'sqlite3'
      && /:memory:$/i.test(connParams.database)
      && (options.min > 1 || options.max > 1))
  {
    console.warn(
      "Pools of more than 1 connection do not work for in-memory SQLite3 databases\n" +
      "The specified minimum (%d) and maximum (%d) connections have been overridden",
      options.min, options.max
    )
    if (options.min) options.min = 1
    options.max = 1
  }
  
  var poolOpts = {
    min: options.min || 0,
    max: options.max || 10,
    create: function (ready) {
      adapter.createConnection(connParams, function (err, conn) {
        if (err) return ready(err);
        else if (options.onConnect) options.onConnect(conn, ready)
        else ready(null, conn)
      })
    },
    destroy: function (conn) {
      conn.end()
      conn._events = {}
    },

    log: options.log
  }

  var resetSteps = [];
  if (adapter.reset) resetSteps.unshift(adapter.reset)
  if (options.reset) resetSteps.unshift(options.reset)
  this.adapter = adapter.name
  this._adapter = adapter
  this._reset = chain(resetSteps)
  this._pool = new Pool(poolOpts)
}

ConnectionPool.prototype.query = function (statement, params, callback) {
  var self = this
    , query = this._adapter.createQuery(statement, params, callback)

  this.acquire(function (err, conn) {
    if (err) {
      if (typeof params === 'function') {
        return params(err)
      } else if (callback) {
        return callback(err);
      } else {
        return query.emit('error', err);
      }
    }
    conn.query(query);
    self.emit('query', query)
    var release = once(self.release.bind(self, conn))
    query.once('end', release).once('error', function (err) {
      release()
      // If this was the only error listener, re-emit the error.
      if (!this.listeners('error').length) {
        this.emit('error', err)
      }
    })
  })

  return query
}

ConnectionPool.prototype.acquire = function (callback) {
  this.emit('acquire')
  this._pool.acquire(callback);
}

ConnectionPool.prototype.release = function (connection) {
  this.emit('release')
  var pool = this._pool
  this._reset(connection, function (err) {
    if (err) return pool.destroy(connection)
    pool.release(connection)
  })
}

ConnectionPool.prototype.destroy = function (connection) {
  this._pool.destroy(connection)
}

ConnectionPool.prototype.close = function (callback) {
  var self = this
  this._pool.drain(function () {
    self._pool.destroyAllNow()
    self.emit('close')
    if (callback) callback()
  })
}

ConnectionPool.prototype.begin = function (beginStatement, callback) {
  var tx = Transaction.begin(this._adapter.createQuery, beginStatement, callback)

  var pool = this
  this.acquire(function (err, connection) {
    if (err) return tx.emit('error', err);
    var release = pool.release.bind(pool, connection)
    tx.on('query', pool.emit.bind(pool, 'query'))
    tx.once('rollback:complete', release)
      .once('commit:complete', release)
      .setConnection(connection)
  })

  return tx;
}
