var libs = {};
var loadedModules = {};

['semver', 'needle', 'strftime'].forEach(function(lib) {
  Object.defineProperty(libs, lib, {
    get: function() {
      if (!loadedModules[lib]) {
        loadedModules[lib] = require(lib);
      }
      return loadedModules[lib];
    }
  });
});


global.UpdatesController = jClass.extend({
  releasesUrl: "https://api.github.com/repos/paxa/Postbird/releases",
  releasesPage: "https://github.com/Paxa/postbird/releases",

  checkUpdates: function () {
    this.fetchLatestRelease(function (err, release) {
      if (release) {
        var current = this.currentVersion();
        var remote = release.tag_name;
        if (libs.semver.gt(remote, current)) {
          var date = new Date(release.published_at);
          var msg = `Newer version is available. ${remote} > ${current}
                     <br>Released at: ${libs.strftime("%d %B %Y, %H:%M", date)}<br>`;
          window.alertify.labels.ok = "Install";
          window.alertify.confirm(msg, function (answer) {
            window.alertify.labels.ok = "OK";
            if (answer) {
              gui.Shell.openExternal(this.releasesPage);
            }
          }.bind(this), 'grey-cancel-button');
        } else {
          window.alertify.alert("You are using latest version");
        }
      }

      //if (err) console.error(err);
      //if (release) console.log(release);

    }.bind(this));
  },

  fetchLatestRelease: function (callback) {
    libs.needle.get(this.releasesUrl, {}, function (err, resp) {
      if (err) {
        callback(err);
      } else {
        var stableRelease = resp.body.filter(function (rel) {
          return !rel.prerelease;
        })[0];
        callback(undefined, stableRelease);
      }
    }.bind(this));
  },

  currentVersion: function () {
    return gui.App.manifest.version;
  }
});
