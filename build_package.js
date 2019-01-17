const builder = require("electron-builder")
const Platform = builder.Platform

var packageJson = require('./package.json');
var childProcess = require('child_process');
var isWin = process.platform === "win32";

var exec = (cmd) => {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        stdout.stderr = stderr;
        resolve(stdout);
      }
    });
  });
}

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});

(async () => {

  let commitsCount = (await exec("git rev-list HEAD --count")).trim();
  let commitID = (await exec("git log --pretty=format:'%h' -n 1")).trim();

  let buildVersion = `${commitsCount} - ${commitID}`;
  console.log('build-version', buildVersion);

  await builder.build({
    //targets: Platform.MAC.createTarget(),
    config: {
      protocols: {
        name: "Postgres Database",
        schemes: ["postgres"],
        role: "Editor"
      },
      fileAssociations: [{
        ext: "sql",
        name: "SQL File",
        //icon: "SQL.icns"
      }],
      npmRebuild: false, // because we changed dependency paths postgres manually
      icon: isWin ? "build_files/icon.ico" : __dirname + "/build_files/icon.icns",
      productName: process.platform == 'linux' ? 'postbird' : 'Postbird',

      mac: {
        category: "public.app-category.developer-tools",
        target: ["dmg"],
        bundleVersion: buildVersion,
        bundleShortVersion: packageJson.version,
        minimumSystemVersion: "10.9.0",
        extendInfo: "build_files/Info.plist"
      },

      linux: {
        category: "Programming",
        target: ["deb", "rpm", "snap"],
        icon: __dirname + "/build_files/icon.png",
        mimeTypes: ["application/sql"],
        description: "Postbird is a cross-platform PostgreSQL GUI client. Simple and efficient, with support of postgres specific features"
      },
      rpm: {
        depends: ["postgresql"],
        icon: __dirname + "/build_files/icon.png",
        desktop: "Postbird",
        synopsis: "PostgreSQL desktop client"
      },
      deb: {
        depends: [
          'gconf2', 'gconf-service', 'libnotify4', 'libappindicator1',
          'libxtst6', 'libnss3', 'libxss1', "postgresql-client"
        ],
        synopsis: "PostgreSQL desktop client"
      },
      snap: {
        grade: "stable",
        summary: "PostgreSQL desktop client"
      },

      nsis: {
        installerIcon: "build_files/icon.ico"
      },
      win: {
        target: ["nsis", "zip"],
        verifyUpdateCodeSignature: false
      }
    }
  })
})();
