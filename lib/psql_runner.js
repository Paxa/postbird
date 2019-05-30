var path = require('path');
var childProcess = require('child_process');
require('./object_extras');

/*::

interface PsqlRunner_Options {
  debug?: boolean
  cwd?: string
}

interface PsqlRunner_Env {
  [column: string] : string[]
}
*/

class PsqlRunner {
  /*::
    options: PsqlRunner_Options
    cmd_args: string[]
    psqlRelativePath: string
    env: PsqlRunner_Env
    process: ChildProcessExt
  */
  constructor (options = {}) {
    this.options = Object.assign({debug: false}, options);
    this.cmd_args = [];

    if (process.platform == 'linux') {
      this.psqlRelativePath = "psql";
    } else {
      this.psqlRelativePath = App.vendorPath + "/psql";
    }

    this.env = {};
    Object.forEach(process.env, (key, value) => {
      this.env[key] = value;
    });
  }

  binaryPath () /*: string */ {
    if (process.platform == 'linux') {
      return this.psqlRelativePath;
    } else {
      var thisDir = path.dirname(module.filename);
      return path.resolve(thisDir, this.psqlRelativePath);
    }
  }

  addArguments (...args) {
    for (let arg of args) {
      if (!this.cmd_args.includes(arg)) {
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
    App.log("exec.strt", {command: commandStr});
    if (this.options.debug) {
      console.log("RUNNING: ", commandStr);
    }

    var startTime = Date.now();
    this.process = childProcess.spawn(this.binaryPath(), this.cmd_args, {cwd: this.options.cwd, env: this.env});

    this.process.stdout.setEncoding('utf8');

    var stdout = "";

    this.process.stderr.on('data', (data) => {
      var str = data.toString();
      console.error('psql error', str);
      //stdout += str;
    });

    return new Promise((resolve, reject) => {
      this.process.on('error', (error) => {
        if (process.platform == 'linux' && error.message == "spawn psql ENOENT") {
          console.error(error)
          error = new Error(
            "Can not find psql in a system. Make sure PostgreSQL client is installed.\n" +
            "On Ubuntu/Debian - package 'postgresql-client'\nOn RHEL/Fedora - package 'postgresql'"
          );
        }
        reject(error);
      });
      this.process.stdout.on('data', (data) => {
        var str = data.toString();
        stdout += str;
      });

      this.process.on('close', (exit_code) => {
        App.log("exec.finish", {command: commandStr, time: Date.now() - startTime});
        if (callback) callback(exit_code == 0, process, stdout);

        exit_code == 0 ? resolve(stdout) : reject(stdout);
      });

      //this.process.on('error', (error, stdout, stderr) => {
      //  console.log(error, stdout, stderr);
      //});
    });
  }

  version () /*: Promise<string> */ {
    this.process = childProcess.spawn(this.binaryPath(), ["--version"], {env: this.env});
    this.process.stdout.setEncoding('utf8');

    var output = "";

    this.process.stdout.on('data', (data) => {
      output += data.toString();
    });

    this.process.stderr.on('data', (data) => {
      output += data.toString();
    });

    return new Promise((resolve, reject) => {
      this.process.on('error', (error) => {
        reject(error);
      });
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
