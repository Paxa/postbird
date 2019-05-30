var path = require('path');

class SqlImporter {
  /*::
  filename: string
  onMessageCallbacks: Function[]
  options: PsqlRunner_Options
  */
  constructor(filename, options = {}) {
    this.filename = filename;
    this.onMessageCallbacks = [];
    this.options = Object.assign({
      debug: false
    }, options);
  }

  doImport (connection, callback) {
    var runner = new PsqlRunner(this.options);

    runner.options.cwd = path.dirname(this.filename);

    runner.addArguments("--no-psqlrc");
    runner.addArguments("-v", "ON_ERROR_STOP=1");
    //runner.addArguments("--single-transaction");

    runner.addArguments("--host=" + connection.options.host);
    runner.addArguments("--username=" + connection.options.user);
    if (connection.options.password && connection.options.password != "") {
      //runner.addArguments("--password=" + connection.options.password);
      runner.env.PGPASSWORD = connection.options.password;
    }
    runner.addArguments("--port=" + connection.options.port);
    runner.addArguments("--dbname=" + connection.options.database);

    //runner.addArguments("-e");

    var promise = new Promise((resolve, reject) => {
      runner.execute(["--file=" + this.filename], (result, process, stdout) => {
        callback && callback(result, stdout);
        result ? resolve(stdout) : reject(stdout);
      }).catch(error => reject(error));
    });

    runner.process.stdout.on('data', (data) => {
      var string = data.toString();
      this.fireMessage(string, true);
    });

    runner.process.stderr.on('data', (data) => {
      var string = data.toString();
      this.fireMessage(string, false);
    });

    return promise;
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

global.SqlImporter = SqlImporter;
module.exports = SqlImporter;
