var inherits = require('inherits')
var FSM = require('yafsm')

module.exports = Transaction

inherits(Transaction, FSM)
function Transaction(opts) {
  opts = opts || {}
  if (typeof opts.createQuery != 'function') {
    throw new Error('opts.createQuery is not a function!')
  }
  this._createQuery = opts.createQuery
  this._statements = {
    begin:    opts.begin    || 'BEGIN',
    commit:   opts.commit   || 'COMMIT',
    rollback: opts.rollback || 'ROLLBACK'
  }
  this._queue = []
  this._nestingLevel = opts.nestingLevel || 0

  FSM.call(this, 'disconnected', {
    'disconnected': [ 'connected' ],
    'connected':    [ 'open', 'closed' ],
    'open':         [ 'connected', 'closed' ]
  })

  if (opts.callback) {
    var callback = opts.callback
    this
      .once('error', callback)
      .once('begin:complete', function () {
        this.removeListener('error', callback)
        callback(null, this)
      })
  }
}

Transaction.begin = function (createQuery, beginStatement, callback) {
  if (typeof beginStatement == 'function') {
    callback = beginStatement
    beginStatement = undefined
  }
  return new Transaction({
    createQuery: createQuery,
    begin: beginStatement,
    callback: callback
  })
}

Transaction.prototype.handleError = function (err, callback) {
  var self = this
  var propagate = callback || function (err) { self.emit('error', err) }
  if (this.state() !== 'closed' && this._connection) {
    Transaction.prototype.rollback.implementations.open.call(this, function (rollbackErr) {
      propagate(err)
    })
  }
  else propagate(err)
}

Transaction.prototype.query = FSM.method('query', {
  'connected|disconnected': function (text, params, callback) {
    return this._queueTask(this._createQuery(text, params, callback))
  },
  'open': function (stmt, params, callback) {
    if (typeof params == 'function') {
      callback = params
      params = undefined
    }
    var queryObject = this._connection.query(stmt, params, callback)
    this.emit('query', queryObject)
    if (!callback) queryObject.on('error', this.handleError)
    return queryObject
  }
})

Transaction.prototype.begin = FSM.method('begin', {
  'open': function (callback) {
    return this._createChildTransaction(callback).setConnection(this._connection)
  },
  'connected|disconnected': function (callback) {
    return this._queueTask(this._createChildTransaction(callback))
  }
})

;['commit', 'rollback'].forEach(function (methodName) {
  Transaction.prototype[methodName] = FSM.method(methodName, {
    'open': closeVia(methodName),
    'connected|disconnected': function (callback) {
      this._queue.push([methodName, [callback]])
      return this
    }
  })
})

Transaction.prototype._queueTask = function (task) {
  this._queue.push(task)
  return task
}

Transaction.prototype._createChildTransaction = function (callback) {
  var nestingLevel = this._nestingLevel + 1
  var savepointName = 'sp_' + nestingLevel

  var tx = new Transaction({
    createQuery:  this._createQuery,
    nestingLevel: nestingLevel,
    callback:     callback,
    begin:        'SAVEPOINT ' + savepointName,
    commit:       'RELEASE SAVEPOINT ' + savepointName,
    rollback:     'ROLLBACK TO ' + savepointName
  })

  tx.on('query', this.emit.bind(this, 'query'))
    .once('connected', this.state.bind(this, 'connected'))
    .once('close',  this._runQueue.bind(this))

  return tx
}

Transaction.prototype.setConnection = FSM.method('setConnection', {
  'disconnected': function (connection) {
    var self = this
    self.state('connected')

    self._onConnectionError = self.handleError.bind(self)
    connection.on('error', self._onConnectionError)

    self._connection = connection
    self.adapter = self._connection.adapter

    self.emit('begin:start')
    var beginQuery = connection.query(self._statements.begin, function (err) {
      if (err) return self.handleError(err)
      self.emit('begin:complete') // removes error listener
      self._runQueue()
    })

    self.emit('query', beginQuery)
    return self
  }
})

Transaction.prototype._runQueue = function () {
  var self = this
  return next()

  var counter = 0
  function next (err) {
    if (err) {
      self._queue.splice(0, self._queue.length)
      return self.handleError(err)
    }
    if (!self._queue.length) {
      if (self.state() !== 'closed' && (err = self.state('open'))) {
        self.handleError(err)
      }
      return
    }

    var task = self._queue.shift()

    if      (Array.isArray(task))         self._runQueuedMethod(task, next)
    else if (task instanceof Transaction) self._runQueuedTransaction(task, next)
    else                                  self._runQueuedQuery(task, next)
  }
}

Transaction.prototype._runQueuedMethod = function (task, next) {
  var method = task.shift()
    , args = task.shift()
    , last = args[args.length - 1]

  if (typeof last == 'function') {
    args[args.length - 1] = function (err) {
      if (err) return last(err)
      last.apply(this, arguments)
      next()
    }
  } else {
    args.push(next)
  }

  this[method].implementations.open.apply(this, args)
}

Transaction.prototype._runQueuedTransaction = function (childTx) {
  if (!childTx.listeners('error').length) {
    childTx.on('error', this.handleError.bind(this))
  }
  childTx.setConnection(this._connection)
}

Transaction.prototype._runQueuedQuery = function (query, callback) {
  var self = this
  var cbName  = query._callback ? '_callback' : 'callback'
  var queryCb = query[cbName]
  if (queryCb) {
    query[cbName] = function (err, res) {
      if (err) return self.handleError(err, queryCb)
      else {
        queryCb(null, res)
        callback()
      }
    }
  } else {
    query.once('error', function (err) {
      if (!query.listeners('error').length) self.handleError(err)
    })

    // Node 0.10 changed the behaviour of EventEmitter.listeners, so we need
    // to do a little poking at internals here.
    query.on('end', function () { callback() })
    if (query.listeners('end').length > 1) {
      var listeners = query._events.end
      listeners.unshift(listeners.pop())
    }
  }
  self.emit('query', query)
  self._connection.query(query)
}

function closeVia (action) {
  return function (callback) {
    var self = this
    var err = self.state('closed')
    if (err) {
      return self.handleError(err, callback)
    }
    self.emit(action + ':start')
    var q = self._connection.query(self._statements[action], function (err) {
      self._close(err, action, callback)
      self._connection.removeListener('error', self._onConnectionError)
      delete self._connection
      if (err) {
        self.handleError(new CloseFailedError(action, err), callback)
      } else {
        self.emit(action + ':complete')
        self.emit('close')
        if (callback) callback()
      }
    })
    self.emit('query', q)
    return self
  }
}

Transaction.prototype._close = function (err, action, callback) {
}

inherits(CloseFailedError, Error)
function CloseFailedError(err, action, previous) {
  Error.captureStackTrace(this, CloseFailedError)
  this.name = action + ' failed'
  this.message = err + "\nError causing rollback: " + previous
}
