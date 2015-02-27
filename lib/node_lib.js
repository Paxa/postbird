var node = {};

var modules = ['child_process', 'fs', 'http', 'https', 'cluster',
  'crypto', 'dns', 'domain', 'net', 'url', 'util', 'vm', 'path',
  'events'
];

var loadedModules = {};

modules.forEach(function(moduleName) {
  Object.defineProperty(node, moduleName, {
    get: function() {
      if (!loadedModules[moduleName]) {
        loadedModules[moduleName] = require(moduleName);
      }
      return loadedModules[moduleName];
    }
  });
});

module.exports = node;
global.node = node;