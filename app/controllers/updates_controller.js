var remote = require('electron').remote;
var semver = require('semver');
var needle = require('needle');
var strftime = require('strftime');

class UpdatesController {

  constructor() {
    this.releasesUrl = "https://api.github.com/repos/paxa/Postbird/releases";
    this.releasesPage = "https://github.com/Paxa/postbird/releases";
  }

  checkUpdates (options) {
    if (options && options.showLoading) {
      App.startLoading("Getting latest version number");
    }

    this.fetchLatestRelease((err, release) => {
      if (options && options.showLoading) {
        App.stopLoading();
      }
      if (release) {
        var current = this.currentVersion();
        var remote = release.tag_name;
        if (semver.gt(remote, current)) {
          var date = new Date(release.published_at);
          var msg = `Newer version is available. ${remote} (You are currently using: ${current})
                     <br>Released at: ${strftime("%d %B %Y, %H:%M", date)}<br>`;
          window.alertify.labels.ok = "Install";
          window.alertify.confirm(msg, (answer) => {
            window.alertify.labels.ok = "OK";
            if (answer) {
              electron.shell.openExternal(this.releasesPage);
            }
          }, 'grey-cancel-button');
        } else {
          if (options && options.showAlreadyLatest) {
            window.alertify.alert("You are using latest version");
          }
        }
      }

      //if (err) console.error(err);
      //if (release) console.log(release);

    });
  }

  fetchLatestRelease (callback) {
    needle.get(this.releasesUrl, {}, (err, resp) => {
      if (err) {
        callback(err);
      } else {
        var stableRelease = resp.body.filter((rel) => {
          return !rel.prerelease;
        })[0];
        callback(undefined, stableRelease);
      }
    });
  }

  currentVersion () {
    return remote.app.getVersion();
  }
}

module.exports = UpdatesController;