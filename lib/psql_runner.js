global.PsqlRunner = jClass.extend({
  cmd_args: [],

  options: {debug: false},

  init: function (options) {
    if (options) {
      this.options = node.util._extend(this.options, options);
    }
    if (process.platform == 'linux') {
      this.psqlRelativePath = "psql";
    } else {
      this.psqlRelativePath = "../vendor/" + process.platform + "/psql";
    }
    this.cmd_args = [];

    this.env = {};
    Object.forEach(process.env, function(key, value) {
      this.env[key] = value;
    }.bind(this));
  },

  psqlPath: function () {
    if (process.platform == 'linux') {
      return this.psqlRelativePath;
    } else {
      var thisDir = node.path.dirname(module.filename);
      return node.path.resolve(thisDir, this.psqlRelativePath);
    }
  },

  addArguments: function() {
    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i];
      if (this.cmd_args.indexOf(arg) == -1) {
        this.cmd_args.push(arg);
      }
    }
  },

  execute: function(extraArgs, callback) {
    if (typeof extraArgs == 'function' && callback === undefined) {
      callback = extraArgs;
      extraArgs = undefined;
    }

    if (extraArgs != undefined) {
      this.addArguments.apply(this, extraArgs);
    }

    var spawn = node.child_process.spawn;

    var commandStr = this.psqlPath() + " " + this.cmd_args.join(" ");
    App.log("exec.strt", {command: commandStr});
    if (this.options.debug) {
      console.log("RUNNING: ", commandStr);
    }

    var startTime = new Date();
    this.process = spawn(this.psqlPath(), this.cmd_args, {cwd: this.options.cwd, env: this.env});

    this.process.stdout.setEncoding('utf8');

    var stdout = "";

    this.process.stderr.on('data', function (data) {
      var str = data.toString();
      console.error('pg_dump error', str);
      //stdout += str;
    });

    this.process.stdout.on('data', function (data) {
      var str = data.toString();
      stdout += str;
    });

    this.process.on('close', function (exit_code) {
      App.log("exec.finish", {command: commandStr, time: Date.now() - startTime});
      if (callback) callback(exit_code == 0, process, stdout);
    }.bind(this));

    this.process.on('error', function (error, stdout, stderr) {
      console.log(error, stdout, stderr);
    });

    return this.process;
  }
});
