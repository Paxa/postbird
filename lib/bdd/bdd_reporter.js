var colors = require('colors');
//var process = require('process');

var puts = function (str, color) {
  if (color !== undefined) {
    process.stdout.write(String(str)[color]);
  } else {
    process.stdout.write(String(str));
  }
}

var shorterPath = function (path) {
  return path.replace(process.env.PWD + "/", '').replace(process.env.HOME, '~');
}

var reporter = {
  failed: 0,
  started: function (allCases) {
    //this.failed = 0;
    this.failedCases = [];
    this.startTime = Date.now();
    puts("Runnung " + allCases.length + " cases:", 'yellow');
  },

  newContext: function (context) {
    puts("\n* " + context.join(": ") + "\n", 'yellow');
  },

  finished: function (allCases) {
    this.finishTime = Date.now();
    var timeSpent = (this.finishTime - this.startTime) / 1000;

    if (this.failedCases.length > 0) {
      puts("\n");
      this.failedCases.forEach(function(failed, i) {
        puts("• " + shorterPath(failed.currentFile) + ":" + failed.currentLine, 'red');
        puts(" # " + failed.name + "\n", 'cyan');
      });
    }

    puts("\n");
    puts("Finished in " + timeSpent + " seconds\n");

    puts(String(allCases.length) + " examples, ", 'yellow');
    puts(String(this.failedCases.length) + " falures, ", this.failedCases.length > 0 ? 'red' : 'yellow');
    puts(String(0) + " pending", 'yellow');

    puts("\n");
  },

  reportError: function reportError (it_case, err) {
    if (err === bdd.stopTest) {
      return;
    }

    if (typeof err == "string" || typeof err == "undefined") {
      err = new Error(err);
    }

    puts('.'.red);
    puts("\n---\n  \"" + it_case.name + "\" failed!\n", 'red');
    puts("  " + err + "\n", 'red');
    //puts("    " + err.stack.join("\n    ") + "\n", 'red');

    var stack = err.stack.split("\n");

    if (err.message) {
      var lines = err.message.split("\n").length;
      for (var i = 0; i <= lines; i++) stack.shift();
    } else {
      stack.shift();
    }

    var lineFound = false;

    for (var i = 0; i < stack.length; i++) {
      var line = stack[i];
      var num = line.match(/eval at describe .+bdd\.js.+ <anonymous>:(\d+):(\d+)/);
      num = num && num[1];
      if (num) {
        lineFound = true;
        num = parseInt(num, 10) - 1;
        //console.log('showing line ', num, "\n", stack[i - 1], "\n", line, "\n", stack[i + 1]);
        var body = it_case.context_fn.toString().split("\n");
        puts(body[num - 2] + "\n", 'blue');
        puts(body[num - 1] + "\n", 'blue');
        puts(body[num] + "\n", 'red');
        puts(body[num + 1] + "\n", 'blue');
        puts(body[num + 2] + "\n", 'blue');

        puts("in file: " + it_case.currentFile + ":" + it_case.currentLine + "\n");

        for (var li = 1; li <= 3; li++) {
          if (stack[li]) puts(stack[li] + "\n");
        }
      }
    }

    if (!lineFound) {
      puts(stack.join("\n"));
    }

    process.stdout.write("\n");

    if (this.failedCases.indexOf(it_case) == -1) {
      this.failedCases.push(it_case);
      //this.failed += 1;
    }
  },

  reportGood: function reportGood (it_case) {
    puts('.'.green);
  },

  puts: puts
};

module.exports = reporter;