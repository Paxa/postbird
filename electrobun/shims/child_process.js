module.exports = {
  exec: (cmd, cb) => {
    console.warn("[child_process.exec not supported in webview]", cmd);
    if (cb) cb(new Error("child_process.exec not supported in webview"));
  },
  spawn: () => {
    console.warn("[child_process.spawn not supported in webview]");
    return {
      on: () => {},
      stdout: { on: () => {} },
      stderr: { on: () => {} },
      kill: () => {},
    };
  },
};
