require('./object_extras');

class PgDumpRunner {

  constructor (options) {
    this.options = {debug: false};

    if (options) {
      this.options = Object.assign({}, this.options, options);
    }

    this.cmd_args = options && options.args || [];
    this.env = {};

    Object.forEach(process.env, (key, value) => {
      this.env[key] = value;
    });

    if (process.platform == 'linux') {
      this.pgDumpRelativePath = "pg_dump";
    } else {
      this.pgDumpRelativePath = "../vendor/" + process.platform + "/pg_dump";
    }
  }

  binaryPath () {
    if (process.platform == 'linux') {
      return this.pgDumpRelativePath;
    } else {
      var thisDir = node.path.dirname(module.filename);
      return node.path.resolve(thisDir, this.pgDumpRelativePath);
    }
  }

  addArguments () {
    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i];
      if (this.cmd_args.indexOf(arg) == -1) {
        this.cmd_args.push(arg);
      }
    }
  }

  execute (extraArgs, callback) {
    if (typeof extraArgs == 'function' && callback === undefined) {
      callback = extraArgs;
      extraArgs = undefined;
    }

    if (extraArgs != undefined) {
      this.addArguments.apply(this, extraArgs);
    }

    var commandStr = this.binaryPath() + " " + this.cmd_args.join(" ");
    App.log("exec.start", {command: commandStr});

    if (this.options.debug) {
      //console.log("RUNNING: ", this.binaryPath(), this.cmd_args);
      console.log("RUNNING: " + commandStr);
    }

    var startTime = new Date();
    this.process = node.child_process.spawn(this.binaryPath(), this.cmd_args, {env: this.env});

    this.process.stdout.setEncoding('utf8');

    var stdout = "";

    this.process.stdout.on('data', (data) => {
      var str = data.toString();
      stdout += str;
    });

    this.process.stderr.on('data', (data) => {
      var str = data.toString();
      console.error('pg_dump error', str);
      //stdout += str;
    });

    return new Promise((resolve, reject) => {
      this.process.on('close', (exit_code) => {
        App.log("exec.finish", {command: commandStr, time: Date.now() - startTime});
        if (callback) callback(exit_code == 0, this.process, stdout);
        exit_code == 0 ? resolve(stdout) : reject(exit_code);
      });
    });

    //return this.process;
  }

  version () {
    this.process = node.child_process.spawn(this.binaryPath(), ["--version"], {env: this.env});
    this.process.stdout.setEncoding('utf8');

    var output = "";

    this.process.stdout.on('data', (data) => {
      output += data.toString();
    });

    this.process.stderr.on('data', (data) => {
      output += data.toString();
    });

    return new Promise((resolve, reject) => {
      this.process.on('close', (exit_code) => {
        if (exit_code == 0) {
          resolve(output.replace(/pg_dump \(PostgreSQL\)\s+/, '').trim());
        } else {
          console.log("pg_dump version error", output);
          console.log(process);
          reject(exit_code);
        }
      });
    });
  }
}

global.PgDumpRunner = PgDumpRunner;
module.exports = PgDumpRunner;
