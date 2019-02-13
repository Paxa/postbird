Error.stackTraceLimit = Infinity;

var ts = require("typescript");
const colors = require('colors/safe');
colors.enabled = true;

var fileNames = [
  'ts_libs/eventemitter2.d.ts',
  'ts_libs/globals.d.ts',
  'app/connection.js',
  'app.js',
  'app/utils.js',
  'app/login_components/heroku_client.js',
  'app/login_components/login_postgres_url_form.js',
  'app/login_components/login_standard_form.js',
  'app/login_screen.js',
  'app/help_screen.js',
  'app/db_screen.js',
  'app/view_helpers.js',
  'app/models/all.js',
  'app/models/base.js',
  'app/models/server.js',
  'app/models/user.js',
  'app/models/column.js',
  'app/models/index.js',
  'app/models/procedure.js',
  'app/models/table.js',
  'app/models/saved_conn.js',
  'app/views/db_screen_view.js',
  'lib/pg_type_names.js'
];

var options = {
  allowJs: true,
  checkJs: true,
  noEmitForJsFiles: false,
  target: ts.ScriptTarget.ES2017,
  noEmit: true,
  alwaysStrict: true,
  allowNonTsExtensions: true,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  module: ts.ModuleKind.ES2015,
  esModuleInterop: true
  //lib: ["lib.d.ts", "es5", "es2015", "es2017", "es2018", "dom", "scripthost"]
};

//ts.supportedTypescriptExtensionsForExtractExtension.push('.js');
//ts.supportedTypeScriptExtensions.push('.js');

//ts.supportedJavascriptExtensions.splice(0, 2);
//ts.supportedJavascriptExtensions = [];
//ts.extensionIsTypeScript = () => { return true; };
//ts.getScriptKindFromFileName = (f) => { console.log(f); return 3; }

//ts.isSourceFileJavaScript = (f) => { return false; };

var createSourceFileOrig = ts.createSourceFile;
ts.createSourceFile = (fileName, text, languageVersion, setParentNodes) => {
  if (fileName.match(/\.js$/)) {
    text = text.replace(/\/\*::([\s\S]+?)\*\//gm, '$1');
    text = text.replace(/\/\*:(.+?)\*\//gm, ':$1');
    //console.log('createSourceFile', fileName, text, languageVersion);
  }

  /*
  if (fileName.match(/@types.+\.d.ts$/) && text.match(/^export\s/m)) {
    console.log('with exports', fileName, languageVersion);

    var moduleName = fileName.match(/@types\/(.+?)\/.+\.d.ts$/);
    if (moduleName) moduleName = moduleName[1];

    var hasImport = text.match(/^import .+$/gm);
    console.log(hasImport);

    //text = text.replace(/^import (.+?) = require\("(.+?)"\);/mg, '/// <reference types="$1" />');
    //text = `declare namespace ${moduleName} {\n${text}\n}`;
  }
  */

  return createSourceFileOrig(fileName, text, languageVersion, setParentNodes);
}

var ensureScriptKindOrig = ts.ensureScriptKind;
ts.ensureScriptKind = (fileName, scriptKind) => {
  //console.log('ensureScriptKind', fileName);
  var ext = fileName.substr(fileName.lastIndexOf("."));
  return ext == '.js' ? 3 : ensureScriptKindOrig(fileName, scriptKind);
};

// Hack to allow delare globals in file with "import ..."
var origtsIsGlobalScopeAugmentation = ts.isGlobalScopeAugmentation;
ts.isGlobalScopeAugmentation1 = (node) => {
  //console.log('isGlobalScopeAugmentation', node.getSourceFile().fileName); //, node.getText());
  if (node.getSourceFile().fileName.includes('node_modules')) {
    return origtsIsGlobalScopeAugmentation(node);
  } else {
    return true;
  }
}

let program = ts.createProgram(fileNames, options);

console.log(`Validating ${program.getSourceFiles().length} files...`);

let emitResult = program.emit();
let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

if (allDiagnostics.length == 0) {
  console.log(colors.green("All good"));
} else {
  console.log(colors.red(`Found ${allDiagnostics.length} ${allDiagnostics.length == 1 ? 'error' : 'errors'}:`));

  allDiagnostics.forEach(diagnostic => {
      if (diagnostic.file) {
          let res = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
          let line = res.line, character = res.character;
          let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
          console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
      } else {
          console.log(`${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
      }
  });
  process.exit(1);
}
