var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

module.exports = StateMachine
module.exports.IllegalTransitionError = IllegalTransitionError;
module.exports.UndefinedMethodError = UndefinedMethodError;

inherits(StateMachine, EventEmitter)
function StateMachine (initialState, transitions) {
  EventEmitter.call(this)

  var currentState = initialState;

  this.state = function (to) {
    if (!to) return currentState;

    if (to === currentState) return;

    var extra = Array.prototype.slice.call(arguments, 1)
      , legal = transitions[currentState]
      ;

    if (legal && legal.indexOf(to) > -1) {
      this.emit('transition', currentState, to);
      currentState = to;
      this.emit(currentState)
    } else {
      return new IllegalTransitionError(currentState, to);
    }
  }
}

StateMachine.method = function (name, implementations) {
  dispatch.implementations = {};
  for (var key in implementations) {
    var states = key.split('|');
    while (states.length) {
      var state = states.shift();
      dispatch.implementations[state] = implementations[key];
    }
  }
  return dispatch;

  function dispatch () {
    var implementation = dispatch.implementations[this.state()];
    if (typeof implementation !== 'function') {
      var error = new StateMachine.UndefinedMethodError(name, this.state());
      var lastArg = [].slice.call(arguments).pop();
      if (typeof lastArg === 'function') {
        lastArg.call(this, error);
      } else {
        var self = this;
        process.nextTick(function () {
          self.emit('error', error);
        })
      }
      return;
    }
    return implementation.apply(this, arguments);
  }
}


inherits(UndefinedMethodError, Error);
function UndefinedMethodError(method, state) {
  Error.captureStackTrace(this, UndefinedMethodError);
  this.name = 'Undefined Method';
  this.message = "method '" + method + "' unavailable in state '" + state + "'";
}

inherits(IllegalTransitionError, Error);
function IllegalTransitionError(from, to) {
  Error.captureStackTrace(this, IllegalTransitionError);
  this.name = 'Illegal Transition';
  this.message = "Transition from '" + from + "' to '" + to + "' not allowed";
}
