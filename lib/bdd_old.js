var colors = require('colors');
var vm = require('vm');

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
  if (typeof err == "string") {
    err = new Error(err);
  }
  puts('.'.red);
  puts("\n---\n  \"" + it_case.name + "\" failed!\n", 'red');
  puts("  " + err + "\n", 'red');
  //puts("    " + err.stack.join("\n    ") + "\n", 'red');

  var stack = err.stack.split("\n");
  for (var i = 0; i < stack.length; i++) {
    var line = stack[i];
    var num = line.match(/eval at describe .+bdd\.js.+ <anonymous>:(\d+):(\d+)/);
    num = num && num[1];
    if (num) {
      num = parseInt(num, 10) - 1;
      //console.log('showing line ', num, "\n", stack[i - 1], "\n", line, "\n", stack[i + 1]);
      var body = it_case.context_fn.toString().split("\n");
      puts(body[num - 2] + "\n", 'blue');
      puts(body[num - 1] + "\n", 'blue');
      puts(body[num] + "\n", 'red');
      puts(body[num + 1] + "\n", 'blue');
      puts(body[num + 2] + "\n", 'blue');
    }
  }
  process.stdout.write("\n");
  process.exit(1);
};

var reportGood = function (it_case) {
  puts('.'.green);
}

var asyncRun = function (fn) {
  // try to find first if function accept arguments
  return fn.toString().match(/^function\s*([\w\d_]+)?\s*\(([\w\d_]+)\)\s*{/)
};

var currentCase;

var runCase = function (it_case, callback) {
  currentCase = it_case;
  if (asyncRun(it_case.runner)) {
    !function () {

      var waiter = setTimeout(function() {
        it_case.status = 'failed';
        reportError(it_case, new Error("spec timed out"));
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
      puts("\n");
      //puts("-- finish\n");
      callback && callback();
    }
  };

  runNext();
};

var env = { };

env.current_context = [];
env.current_context_fn = [];

env.describe = function describe (context, callback) {
  env.current_context = [context];
  env.current_context_fn = callback;
  //console.log(callback.toString());
  with (env) {
    eval("!" + callback.toString() + "()");
  }
};

env.it = function it (name, runner) {
  var it_case = {
    context: env.current_context.slice(0),
    context_fn: env.current_context_fn,
    name: name,
    runner: runner,
    status: 'defined', // status = defined, running, pass, failed
  }; 

  allCases.push(it_case);
};

env.runAllCases = runAllCases;

env.onError = function (exception) {
  reportError(currentCase, exception);
};

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