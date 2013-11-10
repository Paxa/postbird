module.exports = makeChain;

function makeChain(steps) {
	return chain;

  function chain(it, callback) {
		var i = 0, currentStep;
		(function next(err) {
			if (err) return callback(err);
      if ((currentStep = steps[i++])) {
        try {
          currentStep(it, next);
        } catch (err) {
          callback(err);
        }
      } else {
        callback(null, it);
      }
		})();
	}
}

// Self-test
if (require.main === module) {
	var assert = require('assert');
  console.log('1..4');
	makeChain([
		function (thing, next) { thing.prop = 1; next(); },
		function (thing, next) { thing.prop2 = 2; next(); }
	])({}, function (err, thing) {
		assert.equal(thing.prop, 1);
		assert.equal(thing.prop2, 2);
    console.log("ok - all steps called");
	});

	makeChain([
		function (thing, next) { thing.prop = 1; next('error'); },
		function (thing, next) { thing.prop2 = 2; next(); }
	])({}, function (err, thing) {
		assert.equal(err, 'error');
		assert(!thing);
    console.log("ok - errors cause short-circuit");
	});

	makeChain([])('passthru', function (err, thing) {
		assert.equal(thing, 'passthru');
    console.log("ok - empty chain is a pass-through");
	});

	makeChain([
    function (thing, next) { throw "error"; }
  ])('passthru', function (err, thing) {
		assert.equal(err, 'error');
    console.log("ok - thrown errors get forwarded");
	});
}
