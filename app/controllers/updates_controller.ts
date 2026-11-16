var remote = require('@electron/remote');
var semver = require('../../lib/semver').default || require('../../lib/semver');
var strftime = require('../../lib/strftime').default || require('../../lib/strftime');


interface UpdatesController_Options {
  showLoading?: boolean
  showAlreadyLatest?: boolean
}

interface InstallDialogOptions {
  canAutoUpdate?: boolean
  releasesPage?: string
}


class UpdatesController {

  releasesUrl: string
  releasesPage: string

  constructor() {
    this.releasesUrl = "https://api.github.com/repos/Paxa/postbird/releases";
    this.releasesPage = "https://github.com/Paxa/postbird/releases";
  }

  async checkUpdates (options?: UpdatesController_Options) {
    if (options && options.showLoading) {
      App.startLoading("Getting latest version info");
    }

    try {
      const rpc = typeof window !== "undefined" ? (window as any).__postbirdRpc : null;
      if (rpc && typeof rpc.checkForUpdates === "function") {
        const result = await rpc.checkForUpdates();
        if (options && options.showLoading) {
          App.stopLoading();
        }
        if (!result) return;

        const current = result.currentVersion || this.currentVersion();
        if (result.updateAvailable && result.latestVersion) {
          this.showInstallDialog(result.latestVersion, current, result.publishedAt, {
            canAutoUpdate: Boolean(result.canAutoUpdate),
            releasesPage: result.releasesPage || this.releasesPage,
          });
        } else if (options && options.showAlreadyLatest) {
          this.showAlert(`You are using the latest version (${current})`);
        }
        return;
      }

      var release = await this.fetchLatestRelease();
      if (options && options.showLoading) {
        App.stopLoading();
      }

      if (release) {
        var current = this.currentVersion();
        var remoteVersion = release.tag_name;
        if (semver.gt(remoteVersion, current)) {
          this.showInstallDialog(remoteVersion, current, release.published_at, {
            canAutoUpdate: false,
            releasesPage: release.html_url || this.releasesPage,
          });
        } else if (options && options.showAlreadyLatest) {
          this.showAlert(`You are using the latest version (${current})`);
        }
      }
    } catch (err) {
      if (options && options.showLoading) {
        App.stopLoading();
      }
      console.error("[UpdatesController] Error checking updates:", err);
    }
  }

  showAlert (message: string) {
    if (typeof window !== "undefined" && window.alertify && typeof window.alertify.alert === "function") {
      window.alertify.alert(message);
    } else if (typeof $u !== "undefined" && typeof $u.alert === "function") {
      $u.alert(message);
    }
  }

  showInstallDialog (remoteVersion: string, current: string, date?: string | Date, opts?: InstallDialogOptions) {
    const hasDate = Boolean(date);
    const parsedDate = hasDate ? new Date(date as any) : null;
    const displayVersion = String(remoteVersion || "").replace(/^v/, "");
    const datePart = parsedDate && !isNaN(parsedDate.getTime())
      ? ` Released on ${strftime("%d %B %Y, %H:%M", parsedDate)}.`
      : "";
    const msg =
      `<div class="macos-alert-title">Postbird ${displayVersion} is available</div>` +
      `<div class="macos-alert-detail">You are currently using ${current}.${datePart}</div>`;
    const canAutoUpdate = Boolean(opts && opts.canAutoUpdate);
    const targetUrl = (opts && opts.releasesPage) || this.releasesPage;

    window.alertify.labels.ok = canAutoUpdate ? "Install & Restart" : "Install";
    window.alertify.confirm(msg, async (answer) => {
      window.alertify.labels.ok = "OK";
      if (!answer) return;

      const rpc = typeof window !== "undefined" ? (window as any).__postbirdRpc : null;
      if (canAutoUpdate && rpc && typeof rpc.installUpdate === "function") {
        App.startLoading("Downloading and installing update...");
        try {
          const res = await rpc.installUpdate();
          App.stopLoading();
          if (!res || !res.applied) {
            electron.shell.openExternal((res && res.fallbackUrl) || targetUrl);
          }
        } catch (err) {
          App.stopLoading();
          console.error("[UpdatesController] Auto-update install failed, opening releases page:", err);
          electron.shell.openExternal(targetUrl);
        }
      } else {
        electron.shell.openExternal(targetUrl);
      }
    }, 'grey-cancel-button');
  }

  async fetchLatestRelease () {
    try {
      const resp = await fetch(this.releasesUrl);
      const data = await resp.json();
      if (Array.isArray(data)) {
        return data.find((rel: any) => !rel.prerelease && !rel.draft) || null;
      }
      return null;
    } catch (err) {
      console.error("[UpdatesController] Error fetching releases:", err);
      return null;
    }
  }

  currentVersion () {
    return remote.app.getVersion();
  }
}

module.exports = UpdatesController;
(global as any).UpdatesController = UpdatesController;
