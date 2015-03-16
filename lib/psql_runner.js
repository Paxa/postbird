global.PsqlRunner = jClass.extend({
  psqlRelativePath: "../vendor/psql",
  cmd_args: [],

  options: {debug: false},

  init: function (options) {
    if (options) {
      this.options = node.util._extend(this.options, options);
    }
    this.cmd_args = [];
  },

  psqlPath: function () {
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
      console.log("RUNNING: ", this.psqlPath(), this.cmd_args);
      console.log("RUNNING: " + this.psqlPath() + " " + this.cmd_args.join(" "));
    }

    this.process = spawn(this.psqlPath(), this.cmd_args, {cwd: this.options.cwd });

    this.process.stdout.setEncoding('utf8');

    var stdout = "";

    this.process.stdout.on('data', function (data) {
      var str = data.toString();
      stdout += str;
    });

    this.process.on('close', function (exit_code) {
      if (callback) callback(exit_code == 0, process, stdout);
    });

    return this.process;
  }
});
