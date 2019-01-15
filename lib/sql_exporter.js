class SqlExporter {

  constructor(options = {}) {
    this.onMessageCallbacks = [];
    this.options = Object.assign({
      debug: false,
      args: []
    }, options);
  }

  doExport (connection, filename, callback) {
    if (typeof callback == 'undefined' && typeof filename == 'function') {
      callback = filename;
      filename = undefined;
    }

    var runner = new PgDumpRunner(this.options);

    //runner.addArguments("--single-transaction");

    runner.addArguments("--host=" + connection.options.host);
    runner.addArguments("--username=" + connection.options.user);
    if (connection.options.password && connection.options.password != "") {
      runner.env.PGPASSWORD = connection.options.password;
    }
    runner.addArguments("--port=" + connection.options.port);
    runner.addArguments("--dbname=" + connection.options.database);

    //runner.addArguments("-e");

    if (filename) {
      runner.addArguments("--file=" + filename);
    }

    //var stderr = "";

    var promise = runner.execute([]).then(result => {
      callback && callback(result.code == 0, result.stdout, result.stderr)
    });

    runner.process.stdout.on('data', (data) => {
      var string = data.toString();
      this.fireMessage(string, true);
    });

    runner.process.stderr.on('data', (data) => {
      var string = data.toString();
      //stderr += string;
      this.fireMessage(string, false);
    });

    return promise;
  }

  addArgument (arg) {
    this.options.args.push(arg);
  }

  setOnlyStructure () {
    this.addArgument('--schema-only');
  }

  setOnlyData () {
    this.addArgument('--data-only');
  }

  setNoOwners () {
    this.addArgument('--no-owner');
  }

  fireMessage (message, is_stdout) {
    this.onMessageCallbacks.forEach(fn => {
      fn(message, is_stdout);
    });
  }

  onMessage (callback) {
    this.onMessageCallbacks.push(callback);
  }
}

global.SqlExporter = SqlExporter;
window.SqlExporter = global.SqlExporter;

module.exports = SqlExporter;
