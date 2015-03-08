global.SqlExporter = jClass.extend({

  onMessageCallbacks: [],
  options: {debug: true},

  init: function (filename, options) {
    if (options) {
      this.options = node.util._extend(this.options, options);
    }
    this.filename = filename;
    this.onMessageCallbacks = [];
  },

  doExport: function (connection, callback) {
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

    if (this.filename) {
      runner.addArguments("--file=" + this.filename);
    }

    runner.execute([], function(result, process, stdout) {
      if (this.filename) {
        callback(result, stdout);
      } else {
        callback(stdout, result);
      }
    }.bind(this));

    /*
    runner.process.stdout.on('data', function (data) {
      var string = data.toString();
      this.fireMessage(string, true);
    }.bind(this));
    */

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