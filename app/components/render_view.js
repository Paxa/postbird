var pug;
var pugRuntime = require('pug-runtime');
require(__dirname + '/../view_helpers');

var RenderView = {
  root: __dirname.replace(/\/app\/components/, ''),

  pugFn: {},

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
      html = this.compileJade(file)(pugRuntime, new_options);
      //console.log('pug render ' + file + ' in ' + (Date.now() - st) + 'ms');
    } catch (error) {
      console.log("Error compiling '" + RenderView.root + '/views/' + file + '.jade');
      throw error;
    }
    var res = $u.html2collection(html);

    res.find('input, textarea').forEach((el) => {
      $u.textInputMenu(el);
    });

    return res;
  },

  compileJade: function (file) {
    var filepath = RenderView.root + '/views/' + file + '.jade';
    var content = node.fs.readFileSync(filepath, 'utf-8');

    if (this.pugFn[file] && this.pugFn[file].content != content) {
      console.log('remove template cache for: ' + file);
      delete this.pugFn[file];
    }

    if (!this.pugFn[file]) {
      if (!pug) {
        log.info('loading pug....');
        pug = require('pug');
      }
      this.pugFn[file] = pug.compile(content, {filename: filepath, pretty: true, compileDebug: true});
      eval("RenderView.pugFn['" + file + "'] = " + this.pugFn[file].toString().replace('locals', 'pug, locals'));
      this.pugFn[file].content = content;
      this.triggerSaveCache();
    }
    return this.pugFn[file];
  },

  triggerSaveCache: function() {
    if (this.pugCacheTimeout) {
      clearTimeout(this.pugCacheTimeout);
    }
    this.pugCacheTimeout = setTimeout(() => {
      clearTimeout(this.pugCacheTimeout);
      delete this.pugCacheTimeout;
      this.pugCacheSave();
    }, 1000);
  },

  pugCacheSave: function () {
    result = "";
    var convertedPath = (process.env.PWD + '/').replace(/\//g, '\\\\u002F');

    Object.keys(this.pugFn).sort().forEach((key) => {
      var fn = this.pugFn[key];
      console.log(convertedPath, new RegExp(convertedPath, 'g'));
      result += 'exports["' + key + '"] = ' + fn.toString().replace(new RegExp(convertedPath, 'g'), '') + ";\n";
      result += 'exports["' + key + '"].content = ' + JSON.stringify(fn.content) + ";\n";
    });

    node.fs.writeFileSync(this.root + '/views/cache.js', result, 'utf8');
    console.log("Pug cache saved!");
  },

  pugCacheLoad: function() {
    if (node.fs.existsSync(this.root + '/views/cache.js')) {
      var cache = require(this.root + '/views/cache');
      if (cache) {
        this.pugFn = cache;
      }
    }
  }
};

module.exports = RenderView;
