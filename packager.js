var requireg = require('requireg');
var packager = requireg('electron-packager');
var rebuild = requireg('electron-rebuild').rebuild;
var packageJson = require('./package.json');
var child_process = require('child_process');


var opts = {
  electronVersion: '3.0.10',
  dir: '.',
  arch: 'x64',
  platform: process.platform,
  appBundleId: 'com.postbird',
  appCategoryType: 'public.app-category.developer-tools',
  appVersion: packageJson.version,
  buildVersion: packageJson.version,
  icon: 'build_files/icon.icns',
  name: packageJson.name,
  //prune: true,
  overwrite: true,
  out: process.env.HOME + '/Postbird_release',
  protocol: 'postbird',
  extendInfo: 'build_files/Info.plist',
  ignore: [
    'vendor/win32', 'vendor/datasets', 'build_files', 'tests', 'integration_tests', 'assets',
    'node_modules/pug/test',
    'node_modules/pug-lexer/test',
    'node_modules/pug-parser/test',
    'node_modules/pug-linker/test',
    'node_modules/uglify-js'
  ],
  asar: false,
  afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
    rebuild({ buildPath, electronVersion, arch })
      .then(() => callback())
      .catch((error) => callback(error));
  }]
};

child_process.exec('git rev-list HEAD --count', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }

  var commitsCount = stdout.trim();
  child_process.exec("git log --pretty=format:'%h' -n 1", (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return;
    }
    var commitID = stdout;

    opts.buildVersion = commitsCount + ' - ' + commitID;
    console.log('build-version', opts.buildVersion);

    packager(opts, function done (err, appPath) {
      console.log("Done");
      if (err) {
        console.error(err);
      } else {
        console.log(appPath);
      }
    });
  });
});
