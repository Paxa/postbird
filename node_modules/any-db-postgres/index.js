var pg = require('pg')
  , Transaction = require('any-db').Transaction
  , pgNative = null

try { pgNative = pg.native } catch (__e) {}

exports.forceJS = false

exports.createConnection = function (opts, callback) {
	var backend = chooseBackend()
		, conn = new backend.Client(opts)

	conn.begin = begin

	if (callback) {
		conn.connect(function (err) {
			if (err) callback(err)
			else callback(null, conn)
		})
	} else {
		conn.connect()
	}

	return conn
}

// Create a Query object that conforms to the Any-DB interface
exports.createQuery = function (stmt, params, callback) {
	var backend = chooseBackend()
	return new backend.Query(stmt, params, callback)
}

function chooseBackend () {
  return (exports.forceJS || !pgNative) ? pg : pgNative
}

var Transaction = require('any-db').Transaction

var begin = Transaction.createBeginMethod(exports.createQuery)

