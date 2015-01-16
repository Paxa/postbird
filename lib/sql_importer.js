global.SqlImporter = jClass.extend({

  onMessageCallbacks: [],
  options: {debug: true},

  init: function (filename, options) {
    if (options) {
      this.options = node.util._extend(this.options, options);
    }
    this.filename = filename;
    this.onMessageCallbacks = [];
  },

  doImport: function (connection, callback) {
    var runner = new PsqlRunner(this.options);

    runner.options.cwd = node.path.dirname(this.filename);

    runner.addArguments("--no-psqlrc");
    runner.addArguments("-v", "ON_ERROR_STOP=1");
    //runner.addArguments("--single-transaction");

    runner.addArguments("--host=" + connection.options.host);
    runner.addArguments("--username=" + connection.options.user);
    if (connection.options.password && connection.options.password != "") {
      runner.addArguments("--password=" + connection.options.password);
    }
    runner.addArguments("--port=" + connection.options.port);
    runner.addArguments("--dbname=" + connection.options.database);

    //runner.addArguments("-e");

    runner.execute(["--file=" + this.filename], function(result, process, stdout) {
      callback(result, stdout);
    });

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

window.SqlImporter = global.SqlImporter;