var ConnectionPool = require('any-db-pool')
var parseDbUrl     = require('parse-db-url')

Object.defineProperty(exports, 'adapters', {
  get: function () {
    throw new Error(
      "Replace require('any-db').adapters.<blah> with require('any-db-<blah>')"
    )
  }
})

exports.createConnection = function connect (dbUrl, callback) {
  var adapterConfig = parseDbUrl(dbUrl)
  var adapter = getAdapter(adapterConfig.adapter)
  var conn = adapter.createConnection(adapterConfig, callback);
  conn.adapter = adapterConfig.adapter
  return conn
}

exports.createPool = function createPool (dbUrl, poolConfig) {
  var adapterConfig = parseDbUrl(dbUrl);
  var adapter = getAdapter(adapterConfig.adapter)
  return new ConnectionPool(adapter, adapterConfig, poolConfig)
}

function getAdapter (protocol) {
  var name = protocol.replace(':', '').split('+').shift()
  return require('any-db-' + name)
}
