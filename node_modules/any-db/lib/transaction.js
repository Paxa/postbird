var inherits = require('util').inherits
var StateMachine = require('./state-machine')

module.exports = Transaction

inherits(Transaction, StateMachine)
function Transaction(createQuery) {
  if (typeof createQuery != 'function') {
    throw new Error('createQuery is not a function!');
  }
  this._queue = []
  this._createQuery = createQuery
  this.log = false

  this.handleError = forwardOrEmitError.bind(this)

  StateMachine.call(this, 'pending', {
    'query': {
      'pending':        queueQuery,
      'opening':        queueQuery,
      'dequeueing':     queueQuery,
      'open':           doQuery,
      'rollback:start': rejectQuery,
      'commit:start':   rejectQuery,
      'errored':        rejectQuery
    },
    'rollback': {
      'open':    doRollback,
      'errored': doRollback,
      // Allow rollback to be called repeatedly
      'rollback:start':    function (cb) { if (cb) cb() },
      'rollback:complete': function (cb) { if (cb) cb() }
    },
    'commit': {
      'open': doCommit
    }
  },
  // The valid state transitions.
  // A transition to 'errored' is *always* allowed.
  {
    'pending':        [ 'opening' ],
    'opening':        [ 'dequeueing' ],
    'dequeueing':     [ 'open', 'rollback:start', 'commit:start' ],
    'open':           [ 'open', 'rollback:start', 'commit:start' ],
    'errored':        [ 'rollback:start' ],
    'rollback:start': [ 'rollback:complete' ],
    'commit:start':   [ 'commit:complete' ]
  }, this.handleError)

}

// create a .begin method that can be patched on to connection objects
Transaction.createBeginMethod = function (createQuery) {
  return function (stmt, callback) {
    if (stmt && typeof stmt == 'function') {
      callback = stmt
      stmt = undefined
    }
    var t = new Transaction(createQuery)
    t.begin(this, stmt, callback)
    return t
  }
}

function forwardOrEmitError(err, callback) {
  var propagate = callback || this.emit.bind(this, 'error')
  var rolledBack = this.state().match('rollback')
  this.state('errored')
  if (!rolledBack) {
    this.rollback(function (rollbackErr) {
      if (rollbackErr) {
        err = new Error('Failed to rollback transaction: ' + rollbackErr +
                        '\nError causing rollback: ' + err)
      }
      propagate(err)
    })
  }
  else process.nextTick(propagate.bind(this, err))
}

Transaction.prototype.begin = function (conn, statement, callback) {
  if (typeof statement == 'function') {
    callback = statement
    statement = 'begin'
  }
  statement = statement || 'begin';
  if (!this.state('opening', callback)) return this
  var self = this
  if (this.log) this.log('starting transaction')
  var queryObject = conn.query(statement, function (err) {
    if (err) return self.handleError(err, callback)
    this._connection = conn
    conn.on('error', this.handleError)
    this.once('rollback:complete', unsubErrors.bind(this))
    this.once('commit:complete', unsubErrors.bind(this))
    this._runQueue(callback)
  }.bind(this))
  this.emit('query', queryObject)
  return this
}

function unsubErrors() {
  this._connection.removeListener('error', this.handleError);
  delete this._connection
}

Transaction.prototype._runQueue = function (callback) {
  if (!this.state('dequeueing', callback)) return
  var next = function () {
    var state = this.state()
    if (state == 'errored' || state.match('rollback')) return
    var conn = this._connection
      , handleError = this.handleError
      , query = this._queue.shift()
    if (query) {
      // TODO - ask @brianc about changing pg.Query to use '_callback'
      var cbName = query._callback ? '_callback' : 'callback'
      var queryCb = query[cbName]
      if (queryCb) {
        query[cbName] = function (err, res) {
          if (err) return handleError(err, queryCb)
          else if (queryCb) queryCb(err, res)
        }
      } else {
        query.once('error', function (err) {
          if (!query.listeners('error').length) handleError(err)
        })
      }
      this.emit('query', query);
      conn.query(query)

      // Node 0.10 changed the behaviour of EventEmitter.listeners, so we need
      // to do a little poking at internals here.
      query.on('end', next);
      if (query.listeners('end').length > 1) {
        var listeners = query._events.end
        listeners.unshift(listeners.pop())
      }
    } else {
      // The queue is empty, queries can now go directly to the connection.
      this._queue = null
      if (this.state('open', callback) && callback) callback(null, this)
    }
  }.bind(this)
  next()
}

var queueQuery = function (stmt, params, callback) {
  var query = this._createQuery(stmt, params, callback)
  this._queue.push(query)
  return query
}

var doQuery = function (stmt, params, callback) {
  if (typeof params == 'function') {
    callback = params
    params = undefined
  }
  var queryObject = this._connection.query(stmt, params, callback)
  this.emit('query', queryObject)
  if (!callback) queryObject.on('error', this.handleError)
  return queryObject
}

var rejectQuery = function (stmt, params, callback) {
  var q = this._createQuery(stmt, params, callback)
    , msg = "Cannot query in '" + this.state() + "' state. Query: " + stmt
    , err = new Error(msg)
    ;
  process.nextTick(function () {
    if (callback) callback(err)
    else q.emit('error', err)
  })
  return q
}

// Calling 'commit' or 'rollback' on a newly created transaction must wait
// until the query queue has been cleared before doing anything.
;
['commit', 'rollback'].forEach(function (method) {
  Transaction.prototype[method] = function (callback) {
    this.once('open', function () {
      this[method](callback)
    })
  }
})

function sqlTransition(stmt) {
  return function (callback) {
    if (this.state(stmt + ':start', callback)) {
      var queryObject = this._connection.query(stmt, function (err) {
        if (err) return this.handleError(err, callback)
        if (this.state(stmt + ':complete', callback)) {
          if (callback) callback()
        }
      }.bind(this))
      this.emit('query', queryObject)
    }
    return this
  }
}

var doCommit = sqlTransition('commit')
var doRollback = sqlTransition('rollback')
