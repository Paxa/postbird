require('./object_extras');
var path = require('path');
var childProcess = require('child_process');

/*::
interface PgDumpRunner_Options {
  args: string[]
  debug: boolean
}
*/

class PgDumpRunner {
  /*::
  options: PsqlRunner_Options
  cmd_args: string[]
  pgDumpRelativePath: string
  env: PsqlRunner_Env
  process: ChildProcessExt
  */

  constructor (options /*:: ?: PgDumpRunner_Options */) {
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
      this.pgDumpRelativePath = App.vendorPath + "/pg_dump";
    }
  }

  binaryPath () {
    if (process.platform == 'linux') {
      return this.pgDumpRelativePath;
    } else {
      var thisDir = path.dirname(module.filename);
      return path.resolve(thisDir, this.pgDumpRelativePath);
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
    App.log("exec.start", {command: commandStr});

    if (this.options.debug) {
      //console.log("RUNNING: ", this.binaryPath(), this.cmd_args);
      console.log("RUNNING: " + commandStr);
    }

    var startTime = Date.now();
    this.process = childProcess.spawn(this.binaryPath(), this.cmd_args, {env: this.env});

    this.process.stdout.setEncoding('utf8');

    var stdout = "";
    var stderr = "";

    this.process.stdout.on('data', (data) => {
      var str = data.toString();
      stdout += str;
    });

    this.process.stderr.on('data', (data) => {
      var str = data.toString();
      stderr += str;
      console.error('pg_dump error', str);
      //stdout += str;
    });

    return new Promise((resolve, reject) => {
      this.process.on('error', (error) => {
        if (process.platform == 'linux' && error.message == "spawn pg_dump ENOENT") {
          console.error(error)
          resolve({
            code: 1, stdout: stdout,
            stderr: "Can not find pg_dump in a system. Make sure PostgreSQL client is installed.\n" +
                    "On Ubuntu/Debian - package 'postgresql-client'\nOn RHEL/Fedora - package 'postgresql'"
          });
        } else {
          resolve({code: 1, stdout: stdout, stderr: error.message});
        }
      });
      this.process.on('close', (code) => {
        App.log("exec.finish", {command: commandStr, time: Date.now() - startTime});
        if (callback) callback(code == 0, this.process, stdout, stderr);
        resolve({code, stdout, stderr});
      });
    });

    //return this.process;
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
