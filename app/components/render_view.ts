var pug;
var pugRuntime = require('pug-runtime');
var fs = require('fs');

require('../view_helpers');
require('../view_cell_helpers');

var dirname = process.platform === "win32" ? __dirname.replace(/\\/g, '/') : __dirname;

var RenderView = {
  root: dirname.replace(/\/app\/components/, ''),

  pugFn: {},

  renderView: function (file, options) {
    var newOptions = options ? {...this.getViewHelpers(), ...options} : this.getViewHelpers();

    var html;
    try {
      //var st = Date.now();
      html = this.compileJade(file)(pugRuntime, newOptions);
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

  getViewHelpers() {
    if (!this._viewHelpers) {
      this._viewHelpers = {};
      var i;
      for (i in ViewHelpers) {
        if (typeof ViewHelpers[i] == 'function') {
          this._viewHelpers[i] = ViewHelpers[i].bind(ViewHelpers);
        }
      }
      for (i in ViewCellHelpers) {
        if (typeof ViewCellHelpers[i] == 'function') {
          this._viewHelpers[i] = ViewCellHelpers[i].bind(ViewCellHelpers);
        }
      }
    }
    return this._viewHelpers;
  },

  compileJade: function (file) {
    if (this.pugFn[file]) {
      return this.pugFn[file];
    }

    var filepath = RenderView.root + '/views/' + file + '.jade';
    var content = fs.readFileSync(filepath, 'utf-8');

    if (!this.pugFn[file]) {
      if (!pug) {
        logger.info('loading pug....');
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
    // No-op: Views are statically compiled into views/cache.js by scripts/compile_views.ts.
    // Dynamic runtime cache saves are disabled to prevent partially-loaded template sets
    // from overwriting the complete precompiled views repository.
  },

  pugCacheSave: function () {
    // No-op: Disabled to prevent truncating views/cache.js
  },

  pugCacheLoad: function() {
    try {
      var cache = require('../../views/cache');
      if (cache) {
        this.pugFn = cache;
        return;
      }
    } catch (e) {}

    if (fs.existsSync(this.root + '/views/cache.js')) {
      var cache = require(this.root + '/views/cache');
      if (cache) {
        this.pugFn = cache;
      }
    }
  }
};

RenderView.pugCacheLoad();

module.exports = RenderView;
