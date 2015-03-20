global.PgDumpRunner = jClass.extend({
  psqlRelativePath: "../vendor/pg_dump",
  cmd_args: [],

  options: {debug: false},

  init: function (options) {
    if (options) {
      this.options = node.util._extend(this.options, options);
    }
    this.cmd_args = options && options.args || [];
  },

  binaryPath: function () {
    var thisDir = node.path.dirname(module.filename);
    return node.path.resolve(thisDir, this.psqlRelativePath);
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

    if (this.options.debug) {
      //console.log("RUNNING: ", this.binaryPath(), this.cmd_args);
      console.log("RUNNING: " + this.binaryPath() + " " + this.cmd_args.join(" "));
    }

    this.process = spawn(this.binaryPath(), this.cmd_args, {cwd: this.options.cwd });

    this.process.stdout.setEncoding('utf8');

    var stdout = "";

    this.process.stdout.on('data', function (data) {
      var str = data.toString();
      stdout += str;
    });

    this.process.on('close', function (exit_code) {
      if (callback) callback(exit_code == 0, this.process, stdout);
    }.bind(this));

    return this.process;
  }
})