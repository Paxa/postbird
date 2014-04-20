var colors = require('colors');

var allCases = [];
//var current_context = "";

var puts = function (str, color) {
  if (color !== undefined) {
    process.stdout.write(String(str)[color]);
  } else {
    process.stdout.write(String(str));
  }
}
var reportError = function (it_case, err) {
  puts('.'.red);
  puts("\n---\n  \"" + it_case.name + "\" failed!\n", 'red');
  puts("  " + err.message + "\n", 'red');
  puts("    " + err.stack.join("\n    ") + "\n", 'red');
};

var reportGood = function (it_case) {
  puts('.'.green);
}

var asyncRun = function (fn) {
  // try to find first if function accept arguments
  return fn.toString().match(/^function\s*([\w\d_]+)?\s*\(([\w\d_]+)\)\s*{/)
};

var runCase = function (it_case, callback) {
  if (asyncRun(it_case.runner)) {
    !function () {

      var waiter = setTimeout(function() {
        it_case.status = 'failed';
        reportError(it_case, {message: "spec timed out"});
        callback();
      }, 5000);

      var done = function () {
        clearTimeout(waiter);
        it_case.status = 'pass';
        callback();
      };

      try {
        it_case.runner(done);
        reportGood(it_case);
      } catch (e) {
        clearTimeout(waiter);
        it_case.status = 'failed';
        reportError(it_case, e);
        callback();
      }
    }();
  } else {
    try {
      it_case.runner();
      reportGood(it_case);
    } catch (e) {
      it_case.status = 'failed';
      reportError(it_case, e);
    }
    callback();
  }
};

var runAllCases = function (callback) {
  var lastContext = [];

  puts("Runnung " + allCases.length + " cases:", 'yellow');

  var current_i = -1;
  var runNext = function runNext () {
    if (allCases[current_i + 1]) {
      current_i += 1;
      var theCase = allCases[current_i];
      if (theCase.context.toString() != lastContext.toString()) {
        lastContext = theCase.context;
        puts("\n* " + theCase.context.join(": ") + "\n", 'yellow');
      }
      runCase(allCases[current_i], runNext);
    } else {
      puts("-- finish\n");
      callback && callback();
    }
  };

  runNext();
};

var env = { };

env.current_context = [];

env.describe = function describe (context, callback) {
  env.current_context = [context];
  with (env) {
    eval("!" + callback.toString() + "()");
  }
};

env.it = function it (name, runner) {
  var it_case = {
    context: env.current_context.slice(0),
    name: name,
    runner: runner,
    status: 'defined', // status = defined, running, pass, failed
  }; 

  allCases.push(it_case);
};

env.runAllCases = runAllCases;

var describe = env.describe;


module.exports = env

/*
describe('String', function() {
  it('should wait abit', function(done) {
    setTimeout(done, 200);
  });

  it('should wait abit', function(done) {
    setTimeout(done, 200);
  });

  it('should be initialized', function() {
    var s = "";
    s.should.be.a.String;
    //s.should.be.an.Array;
  });

  it('should be initialized with exception', function() {
    var s = "".wrongMethod();
  });
});

runAllCases();
*/