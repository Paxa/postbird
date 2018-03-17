require('./object_extras');

class PsqlRunner {

  constructor (options = {}) {
    this.options = Object.assign({debug: false}, options);
    this.cmd_args = [];

    if (process.platform == 'linux') {
      this.psqlRelativePath = "psql";
    } else {
      this.psqlRelativePath = "../vendor/" + process.platform + "/psql";
    }

    this.env = {};
    Object.forEach(process.env, (key, value) => {
      this.env[key] = value;
    });
  }

  binaryPath () {
    if (process.platform == 'linux') {
      return this.psqlRelativePath;
    } else {
      var thisDir = node.path.dirname(module.filename);
      return node.path.resolve(thisDir, this.psqlRelativePath);
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

    var spawn = node.child_process.spawn;

    var commandStr = this.binaryPath() + " " + this.cmd_args.join(" ");
    App.log("exec.strt", {command: commandStr});
    if (this.options.debug) {
      console.log("RUNNING: ", commandStr);
    }

    var startTime = new Date();
    this.process = spawn(this.binaryPath(), this.cmd_args, {cwd: this.options.cwd, env: this.env});

    this.process.stdout.setEncoding('utf8');

    var stdout = "";

    this.process.stderr.on('data', (data) => {
      var str = data.toString();
      console.error('pg_dump error', str);
      //stdout += str;
    });

    new Promise((resolve, reject) => {
      this.process.stdout.on('data', (data) => {
        var str = data.toString();
        stdout += str;
      });

      this.process.on('close', (exit_code) => {
        App.log("exec.finish", {command: commandStr, time: Date.now() - startTime});
        if (callback) callback(exit_code == 0, process, stdout);

        exit_code == 0 ? resolve(stdout) : reject(stdout);
      });

      this.process.on('error', (error, stdout, stderr) => {
        console.log(error, stdout, stderr);
      });
    });
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
          resolve(output.replace(/psql \(PostgreSQL\)\s+/, '').trim());
        } else {
          console.log("psql version error", output);
          console.log(process);
          reject(exit_code);
        }
      });
    });
  }
}

global.PsqlRunner = PsqlRunner;
module.exports = PsqlRunner;
