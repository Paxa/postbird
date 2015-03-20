global.SqlExporter = jClass.extend({

  onMessageCallbacks: [],
  options: {debug: false, args: []},

  init: function (options) {
    this.options.args = [];

    if (options) {
      this.options = node.util._extend(this.options, options);
    }
    this.onMessageCallbacks = [];
  },

  doExport: function (connection, filename, callback) {
    if (typeof callback == 'undefined' && typeof filename == 'function') {
      callback = filename;
      filename = undefined;
    }

    var runner = new PgDumpRunner(this.options);

    //runner.addArguments("--single-transaction");

    runner.addArguments("--host=" + connection.options.host);
    runner.addArguments("--username=" + connection.options.user);
    if (connection.options.password && connection.options.password != "") {
      runner.addArguments("--password=" + connection.options.password);
    }
    runner.addArguments("--port=" + connection.options.port);
    runner.addArguments("--dbname=" + connection.options.database);

    //runner.addArguments("-e");

    if (filename) {
      runner.addArguments("--file=" + filename);
    }

    var stderr = "";

    runner.execute([], function(result, process, stdout) {
      callback(result, stdout, stderr, process);
    }.bind(this));

    runner.process.stdout.on('data', function (data) {
      var string = data.toString();
      this.fireMessage(string, true);
    }.bind(this));

    runner.process.stderr.on('data', function (data) {
      var string = data.toString();
      stderr += string;
      this.fireMessage(string, false);
    }.bind(this));
  },

  addArgument: function (arg) {
    this.options.args.push(arg);
  },

  fireMessage: function (message, is_stdout) {
    this.onMessageCallbacks.forEach(function(fn) {
      fn(message, is_stdout);
    });
  },

  onMessage: function (callback) {
    this.onMessageCallbacks.push(callback);
  }
});

window.SqlExporter = global.SqlExporter;