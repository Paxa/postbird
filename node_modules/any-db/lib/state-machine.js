var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

module.exports = StateMachine

inherits(StateMachine, EventEmitter)
function StateMachine (initialState, methods, transitions, onError) {
	EventEmitter.call(this)

	var currentState = initialState
		, assignMethods;

	(assignMethods = (function () {
		for (var methodName in methods) {
			if (currentState in methods[methodName]) {
				this[methodName] = methods[methodName][currentState]
			}
		}
	}).bind(this))()

	var removeMethods = (function () {
		for (var methodName in methods) {
			if (currentState in methods[methodName]) delete this[methodName]
		}
	}).bind(this)

	this.state = function (to) {
		if (!to) return currentState;

		if (to === currentState) return true;

		var extra = Array.prototype.slice.call(arguments, 1)
		  , legal = transitions[currentState]

		if (to === 'errored' || legal && legal.indexOf(to) > -1) {
			this.log && this.log("Transition from:'" + currentState + "' to:'" + to + "'")
			removeMethods();
			currentState = to;
			assignMethods();
			this.emit(currentState)
			return true
		} else {
			var msg = "Illegal transition from:'" + currentState + "' to:'" + to + "'"
			extra.unshift(new Error(msg))
			onError.apply(this, extra)
			return false
		}
	}
}
