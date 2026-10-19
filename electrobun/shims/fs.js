module.exports = {
  existsSync: (path) => {
    if (typeof path === 'string' && path.includes('cache.js')) return true;
    return false;
  },
  readFileSync: (path) => "",
  writeFileSync: () => {},
  readdirSync: () => [],
  statSync: () => ({ isDirectory: () => false }),
  mkdirSync: () => {},
};
