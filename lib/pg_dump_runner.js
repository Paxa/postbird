global.PgDumpRunner = jClass.extend({
  cmd_args: [],

  options: {debug: false},

  init: function (options) {
    if (options) {
      this.options = node.util._extend(this.options, options);
    }
    this.cmd_args = options && options.args || [];
    this.env = {};
    Object.forEach(process.env, function(key, value) {
      this.env[key] = value;
    }.bind(this));

    if (process.platform == 'linux') {
      this.pgDumpRelativePath = "pg_dump";
    } else {
      this.pgDumpRelativePath = "../vendor/" + process.platform + "/pg_dump";
    }
  },

  binaryPath: function () {
    if (process.platform == 'linux') {
      return this.pgDumpRelativePath;
    } else {
      var thisDir = node.path.dirname(module.filename);
      return node.path.resolve(thisDir, this.pgDumpRelativePath);
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

    var commandStr = this.binaryPath() + " " + this.cmd_args.join(" ");
    App.log("exec.start", {command: commandStr});
    if (this.options.debug) {
      //console.log("RUNNING: ", this.binaryPath(), this.cmd_args);
      console.log("RUNNING: " + commandStr);
    }

    var startTime = new Date();
    this.process = spawn(this.binaryPath(), this.cmd_args, {env: this.env});

    this.process.stdout.setEncoding('utf8');

    var stdout = "";

    this.process.stdout.on('data', function (data) {
      var str = data.toString();
      stdout += str;
    });

    this.process.stderr.on('data', function (data) {
      var str = data.toString();
      console.error('pg_dump error', str);
      //stdout += str;
    });

    this.process.on('close', function (exit_code) {
      App.log("exec.finish", {command: commandStr, time: Date.now() - startTime});
      if (callback) callback(exit_code == 0, this.process, stdout);
    }.bind(this));

    return this.process;
  }
})