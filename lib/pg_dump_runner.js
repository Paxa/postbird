require('./object_extras');
var path = require('path');
var childProcess = require('child_process');

/*::
interface PgDumpRunner_Options {
  args: string[]
  debug: boolean
}

interface PgDumpRunner_Result {
  code: number
  stdout?: string
  stderr?: string
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
      this.pgDumpRelativePath = App.vendorPath + "/bin/pg_dump";
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

  execute (extraArgs, callback /*:: ?: Function */) /*: Promise<PgDumpRunner_Result> */ {
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
    var exited = false;

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
          exited = true;
        }
      });
      this.process.on('exit', (exitCode, signal) => {
        if (!exited) {
          console.log('pg_dump exit code', exitCode, signal);
          if (exitCode == null) {
            var exitCode = 1;
          }
          reject({code: exitCode, stdout: stdout, stderr: stderr});
          exited = true;
        }
      });
      this.process.on('close', (code) => {
        App.log("exec.finish", {command: commandStr, time: Date.now() - startTime});
        if (callback) callback(code == 0, this.process, stdout, stderr);
        resolve({code, stdout, stderr});
        exited = true;
      });
    });

    //return this.process;
  }

  version () /*: Promise<string> */ {
    var child = childProcess.spawn('which', ['pg_dump']);
    child.stdout.on('data', (data) => {
      console.log(`child stdout:\n${data}`);
    });

    var child1 = childProcess.spawn('pg_dump', ['--version']);
    child1.stdout.on('data', (data) => {
      console.log(`child stdout:\n${data}`);
    });

    this.process = childProcess.spawn(this.binaryPath(), ["--version"], {env: this.env});
    this.process.stdout.setEncoding('utf8');

    var output = "";
    var exited = false;

    this.process.stdout.on('data', (data) => {
      output += data.toString();
    });

    this.process.stderr.on('data', (data) => {
      output += data.toString();
    });

    return new Promise((resolve, reject) => {
      this.process.on('error', (error) => {
        reject(error);
        exited = true;
      });

      this.process.on('exit', (exitCode, signal) => {
        if (!exited) {
          console.log('pg_dump exit code', exitCode, signal);
          reject(exitCode);
          exited = true;
        }
      });

      this.process.on('close', (exitCode) => {
        if (exitCode == 0) {
          resolve(output.replace(/pg_dump \(PostgreSQL\)\s+/, '').trim());
          exited = true;
        } else {
          console.log("pg_dump version error", output, exitCode);
          console.log(process);
          reject(exitCode);
          exited = true;
        }
      });
    });
  }
}

global.PgDumpRunner = PgDumpRunner;
module.exports = PgDumpRunner;
