var Libpq = require('libpq');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var assert = require('assert');
var types = require('pg-types');

var Client = module.exports = function(config) {
  if(!(this instanceof Client)) {
    return new Client(config);
  }

  config = config || {};

  EventEmitter.call(this);
  this.pq = new Libpq();
  this._reading = false;
  this._read = this._read.bind(this);

  //allow custom type converstion to be passed in
  this._types = config.types || types;

  //allow config to specify returning results
  //as an array of values instead of a hash
  this.arrayMode = config.arrayMode || false;
  var self = this;

  //lazy start the reader if notifications are listened for
  //this way if you only run sync queries you wont block
  //the event loop artificially
  this.on('newListener', function(event) {
    if(event != 'notification') return;
    self._startReading();
  });
};

util.inherits(Client, EventEmitter);

Client.prototype.connect = function(params, cb) {
  this.pq.connect(params, cb);
};

Client.prototype.connectSync = function(params) {
  this.pq.connectSync(params);
};

Client.prototype._parseResults = function(pq, rows) {
  var rowCount = pq.ntuples();
  var colCount = pq.nfields();
  for(var i = 0; i < rowCount; i++) {
    var row = this.arrayMode ? [] : {};
    rows.push(row);
    for(var j = 0; j < colCount; j++) {
      var rawValue = pq.getvalue(i, j);
      var value = rawValue;
      if(rawValue == '') {
        if(pq.getisnull(i, j)) {
          value = null;
        }
      } else {
        value = this._types.getTypeParser(pq.ftype(j))(rawValue);
      }
      if(this.arrayMode) {
        row.push(value);
      } else {
        row[pq.fname(j)] = value;
      }
    }
  }
  return rows;
}

Client.prototype.end = function(cb) {
  this._stopReading();
  this.pq.finish();
  if(cb) setImmediate(cb);
};

Client.prototype._readError = function(message) {
  this._stopReading();
  var err = new Error(message || this.pq.errorMessage());
  this.emit('error', err);
};

Client.prototype._stopReading = function() {
  if(!this._reading) return;
  this._reading = false;
  this.pq.stopReader();
  this.pq.removeListener('readable', this._read);
};

//called when libpq is readable
Client.prototype._read = function() {
  var pq = this.pq;
  //read waiting data from the socket
  //e.g. clear the pending 'select'
  if(!pq.consumeInput()) {
    //if consumeInput returns false
    //than a read error has been encountered
    return this._readError();
  }

  //check if there is still outstanding data
  //if so, wait for it all to come in
  if(pq.isBusy()) {
    return;
  }

  //load our result object
  var rows = []
  while(pq.getResult()) {
    if(pq.resultStatus() == 'PGRES_TUPLES_OK') {
      this._parseResults(this.pq, rows);
    }
    if(pq.resultStatus() == 'PGRES_COPY_OUT')  break;
  }


  var status = pq.resultStatus();
  switch(status) {
    case 'PGRES_FATAL_ERROR':
      return this._readError();
    case 'PGRES_COMMAND_OK':
    case 'PGRES_TUPLES_OK':
    case 'PGRES_COPY_OUT':
    case 'PGRES_EMPTY_QUERY': {
      this.emit('result', rows);
      break;
    }
    default:
      return this._readError('unrecognized command status: ' + status);
  }

  var notice;
  while(notice = this.pq.notifies()) {
    this.emit('notification', notice);
  }
};

//ensures the client is reading and
//everything is set up for async io
Client.prototype._startReading = function() {
  if(this._reading) return;
  this._reading = true;
  this.pq.on('readable', this._read);
  this.pq.startReader();
};

var throwIfError = function(pq) {
  var err = pq.resultErrorMessage() || pq.errorMessage();
  if(err) {
    throw new Error(err);
  }
}

Client.prototype._awaitResult = function(cb) {
  var self = this;
  var onError = function(e) {
    self.removeListener('error', onError);
    self.removeListener('result', onResult);
    cb(e);
  };

  var onResult = function(rows) {
    self.removeListener('error', onError);
    self.removeListener('result', onResult);
    cb(null, rows);
  };
  this.once('error', onError);
  this.once('result', onResult);
  this._startReading();
};

//wait for the writable socket to drain
Client.prototype.waitForDrain = function(pq, cb) {
  var res = pq.flush();
  //res of 0 is success
  if(res === 0) return cb();

  //res of -1 is failure
  if(res === -1) return cb(pq.errorMessage());

  //otherwise outgoing message didn't flush to socket
  //wait for it to flush and try again
  var self = this
  //you cannot read & write on a socket at the same time
  return pq.writable(function() {
    self.waitForDrain(pq, cb)
  });
};

//send an async query to libpq and wait for it to
//finish writing query text to the socket
Client.prototype.dispatchQuery = function(pq, fn, cb) {
  this._stopReading();
  var success = pq.setNonBlocking(true);
  if(!success) return cb(new Error('Unable to set non-blocking to true'));
  var sent = fn();
  if(!sent) return cb(new Error(pq.errorMessage() || 'Something went wrong dispatching the query'));
  this.waitForDrain(pq, cb);
};

Client.prototype.query = function(text, values, cb) {
  var queryFn;

  if(typeof values == 'function') {
    cb = values;
    queryFn = function() { return self.pq.sendQuery(text); };
  } else {
    queryFn = function() { return self.pq.sendQueryParams(text, values); };
  }

  var self = this

  self.dispatchQuery(self.pq, queryFn, function(err) {
    if(err) return cb(err);

    self._awaitResult(cb)
  });
};

Client.prototype.prepare = function(statementName, text, nParams, cb) {
  var self = this;
  var fn = function() {
    return self.pq.sendPrepare(statementName, text, nParams);
  }

  self.dispatchQuery(self.pq, fn, function(err) {
    if(err) return cb(err);
    self._awaitResult(cb);
  });
};

Client.prototype.execute = function(statementName, parameters, cb) {
  var self = this;

  var fn = function() {
    return self.pq.sendQueryPrepared(statementName, parameters);
  };

  self.dispatchQuery(self.pq, fn, function(err, rows) {
    if(err) return cb(err);
    self._awaitResult(cb)
  });
};

var CopyStream = require('./lib/copy-stream');
Client.prototype.getCopyStream = function() {
  this.pq.setNonBlocking(true);
  this._stopReading();
  return new CopyStream(this.pq);
};

//cancel a currently executing query
Client.prototype.cancel = function(cb) {
  assert(cb, 'Callback is required');
  //result is either true or a string containing an error
  var result = this.pq.cancel();
  return setImmediate(function() {
    cb(result === true ? undefined : new Error(result));
  });
};

Client.prototype.querySync = function(text, values) {
  var queryFn;
  var pq = this.pq;
  pq[values ? 'execParams' : 'exec'].call(pq, text, values);
  throwIfError(this.pq);
  return this._parseResults(pq, []);
};

Client.prototype.prepareSync = function(statementName, text, nParams) {
  this.pq.prepare(statementName, text, nParams);
  throwIfError(this.pq);
};

Client.prototype.executeSync = function(statementName, parameters) {
  this.pq.execPrepared(statementName, parameters);
  throwIfError(this.pq);
  return this._parseResults(this.pq, []);
};

Client.prototype.escapeLiteral = function(value) {
  return this.pq.escapeLiteral(value);
};

Client.prototype.escapeIdentifier = function(value) {
  return this.pq.escapeIdentifier(value);
};

//export the version number so we can check it in node-postgres
module.exports.version = require('./package.json').version
