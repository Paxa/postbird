var remote = require('electron').remote;
var semver = require('semver');
var needle = require('needle');
var strftime = require('strftime');

/*::
interface UpdatesController_Options {
  showLoading: boolean
  showAlreadyLatest: boolean
}
*/

class UpdatesController {
  /*::
  releasesUrl: string
  releasesPage: string
  */
  constructor() {
    this.releasesUrl = "https://api.github.com/repos/paxa/Postbird/releases";
    this.releasesPage = "https://github.com/Paxa/postbird/releases";
  }

  async checkUpdates (options /*:: ?: UpdatesController_Options */) {
    if (options && options.showLoading) {
      App.startLoading("Getting latest version info");
    }

    var release = await this.fetchLatestRelease();

    if (options && options.showLoading) {
      App.stopLoading();
    }

    if (release) {
      var current = this.currentVersion();
      var remote = release.tag_name;
      if (semver.gt(remote, current)) {
        this.showInstallDialog(remote, current, release.published_at);
      } else {
        if (options && options.showAlreadyLatest) {
          $u.alert(`You are using the latest version (${current})`);
        }
      }
    }
  }

  showInstallDialog (remote, current, date) {
    date = new Date(date);
    var msg = `Newer version is available. ${remote} (You are currently using: ${current})
               <br>Released at: ${strftime("%d %B %Y, %H:%M", date)}<br>`;
    window.alertify.labels.ok = "Install";
    window.alertify.confirm(msg, (answer) => {
      window.alertify.labels.ok = "OK";
      if (answer) {
        electron.shell.openExternal(this.releasesPage);
      }
    }, 'grey-cancel-button');
  }

  fetchLatestRelease () {
    return needle("get", this.releasesUrl, {}).then(resp => {
      var stableRelease = resp.body.filter((rel) => {
        return !rel.prerelease;
      })[0];
      return Promise.resolve(stableRelease);
    });
  }

  currentVersion () {
    return remote.app.getVersion();
  }
}

module.exports = UpdatesController;
global.UpdatesController = UpdatesController;