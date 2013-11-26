global.Notificator = {
  show: function (message, title) {
    title = title || "Postbird";
    var sys = require('sys')
    var exec = require('child_process').exec;
    function puts(error, stdout, stderr) { sys.puts(stdout) }
    exec("./notifier.app/Contents/MacOS/terminal-notifier -title '" + title + "' -message '" + message + "' -sender com.postbird -sound default", puts);
  }
}