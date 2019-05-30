Error.stackTraceLimit = Infinity;

var ts = require("typescript");
const colors = require('colors/safe');
colors.enabled = true;

var fileNames = [
  'ts_libs/eventemitter2.d.ts',
  'ts_libs/globals.d.ts',
  'index.js',
  'app/connection.js',
  'app.js',
  'app/logger.js',
  'app/top_menu.js',
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
  'app/models/trigger.js',
  'app/models/saved_conn.js',
  'app/models/last_query.js',
  'app/views/db_screen_view.js',
  'app/views/snippets.js',
  'app/views/history_window.js',
  'app/views/panes/base.js',
  'app/views/panes/content.js',
  'app/views/panes/extensions.js',
  'app/views/panes/info.js',
  'app/views/panes/procedures.js',
  'app/views/panes/query.js',
  'app/views/panes/structure.js',
  'app/views/panes/users.js',
  'app/views/panes/all.js',
  'lib/pg_type_names.js',
  'lib/sql_importer.js',
  'lib/psql_runner.js',
  'lib/pg_dump_runner.js',
  'lib/sidebar_resize.js',
  'lib/error_reporter.js',
  'lib/resizable_columns.js',
  'lib/query_tab_resizer.js',
  'lib/widgets/generic_table.js',
  'app/views/dialogs/base.js',
  'app/views/dialogs/all.js',
  'app/views/dialogs/def_procedure.js',
  'app/views/dialogs/edit_column.js',
  'app/views/dialogs/edit_procedure.js',
  'app/views/dialogs/edit_user.js',
  'app/views/dialogs/edit_value.js',
  'app/views/dialogs/export_file.js',
  'app/views/dialogs/heroku_connection.js',
  'app/views/dialogs/import_file.js',
  'app/views/dialogs/list_languages.js',
  'app/views/dialogs/new_column.js',
  'app/views/dialogs/new_database.js',
  'app/views/dialogs/new_index.js',
  'app/views/dialogs/new_snippet.js',
  'app/views/dialogs/new_table.js',
  'app/views/dialogs/new_user.js',
  'app/views/dialogs/related_records.js',
  'app/views/dialogs/show_sql.js',
  'app/views/dialogs/user_grants.js',
  'app/controllers/export_controller.js',
  'app/controllers/import_controller.js',
  'app/controllers/updates_controller.js',
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
