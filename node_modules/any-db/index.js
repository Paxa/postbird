var ConnectionPool = require('any-db-pool')
var parseDbUrl     = require('./lib/parse-url')
var Transaction    = require('./lib/transaction')

Object.defineProperty(exports, 'adapters', {
  get: function () {
    throw new Error(
      "Replace require('any-db').adapters.<blah> with require('any-db-<blah>')"
    )
  }
})

// Re-export Transaction for adapters
exports.Transaction = Transaction

exports.createConnection = function connect (dbUrl, callback) {
  var adapterConfig = parseDbUrl(dbUrl)
  var adapter = getAdapter(adapterConfig.adapter)
  return adapter.createConnection(adapterConfig, callback)
}

exports.createPool = function getPool (dbUrl, poolConfig) {
  poolConfig = poolConfig || {}
  if (poolConfig.create || poolConfig.destroy) {
    throw new Error(
      "Use onConnect/reset options instead of create/destroy."
    )
  }
  var adapterConfig = parseDbUrl(dbUrl);
  var adapter = getAdapter(adapterConfig.adapter);

  var pool = new ConnectionPool(adapter, adapterConfig, poolConfig)

  pool.begin = function (stmt, callback) {
    if (stmt && typeof stmt == 'function') {
      callback = stmt
      stmt = undefined
    }
    var t = new Transaction(adapter.createQuery)
    // Proxy query events from the transaction to the pool
    t.on('query', pool.emit.bind(this, 'query'))

    pool.acquire(function (err, conn) {
      if (err) return callback ? callback(err) : t.emit('error', err)
      t.begin(conn, stmt, callback)
      var release = pool.release.bind(pool, conn)
      t.once('rollback:complete', release)
      t.once('commit:complete', release)
    }.bind(pool))
    return t
  }
  return pool
}

function getAdapter (protocol) {
  var name = protocol.replace(':', '').split('+').shift()
  return require('any-db-' + name);
}
