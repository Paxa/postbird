var jade;
var jadeRuntime = require('jade/runtime');
require(__dirname + '/../view_helpers');

var RenderView = {
  root: __dirname.replace(/\/app\/components/, ''),

  jadeFn: {},

  renderView: function (file, options) {
    var html;
    var new_options = {};
    var i;

    for (i in ViewHelpers) new_options[i] = ViewHelpers[i].bind(ViewHelpers);

    if (options) {
      for (i in options) new_options[i] = options[i];
    }

    try {
      //var st = Date.now();
      html = this.compileJade(file)(jadeRuntime, new_options);
      //console.log('jade render ' + file + ' in ' + (Date.now() - st) + 'ms');
    } catch (error) {
      console.log("Error compiling '" + RenderView.root + '/views/' + file + '.jade');
      throw error;
    }
    var res = $u.html2collection(html);

    res.find('input, textarea').each(function (i, el) {
      $u.textInputMenu(el);
    });

    return res;
  },

  compileJade: function (file) {
    var filepath = RenderView.root + '/views/' + file + '.jade';
    var content = node.fs.readFileSync(filepath, 'utf-8');

    if (this.jadeFn[file] && this.jadeFn[file].content != content) {
      console.log('remove template cache for: ' + file);
      delete this.jadeFn[file];
    }

    if (!this.jadeFn[file]) {
      if (!jade) {
        log.info('loading jade....');
        jade = require('jade');
      }
      this.jadeFn[file] = jade.compileClient(content, {filename: filepath, pretty: true, compileDebug: true});
      eval("RenderView.jadeFn['" + file + "'] = " + this.jadeFn[file].replace('locals', 'jade, locals'));
      this.jadeFn[file].content = content;
      this.triggerSaveCache();
    }
    return this.jadeFn[file];
  },

  triggerSaveCache: function() {
    if (this.jadeCacheTimeout) {
      clearTimeout(this.jadeCacheTimeout);
    }
    this.jadeCacheTimeout = setTimeout(function() {
      clearTimeout(this.jadeCacheTimeout);
      delete this.jadeCacheTimeout;
      this.jadeCacheSave();
    }.bind(this), 1000);
  },

  jadeCacheSave: function () {
    result = "";
    Object.keys(this.jadeFn).sort().forEach(function(key) {
      var fn = this.jadeFn[key];
      result += 'exports["' + key + '"] = ' + fn.toString() + ";\n";
      result += 'exports["' + key + '"].content = ' + JSON.stringify(fn.content) + ";\n";
    }.bind(this));

    node.fs.writeFileSync(this.root + '/views/cache.js', result, 'utf8');
    console.log("Jade cache saved!");
  },

  jadeCacheLoad: function() {
    if (node.fs.existsSync(this.root + '/views/cache.js')) {
      var cache = require(this.root + '/views/cache');
      if (cache) {
        this.jadeFn = cache;
        console.log("Loaded templates cache " + Object.keys(this.jadeFn));
      }
    }
  }
};

module.exports = RenderView;
