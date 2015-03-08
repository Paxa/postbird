global.SqlExporter = jClass.extend({

  onMessageCallbacks: [],
  options: {debug: true},

  init: function (filename, options) {
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

    runner.options.cwd = node.path.dirname(this.filename);

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

    runner.execute([], function(result, process, stdout) {
      callback(result, stdout);
    }.bind(this));

    runner.process.stdout.on('data', function (data) {
      var string = data.toString();
      this.fireMessage(string, true);
    }.bind(this));

    runner.process.stderr.on('data', function (data) {
      var string = data.toString();
      this.fireMessage(string, false);
    }.bind(this));
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