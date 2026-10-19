class SimpleEmitter {
  constructor() {
    this._events = {};
  }
  on(event, fn) {
    (this._events[event] = this._events[event] || []).push(fn);
    return this;
  }
  removeListener(event, fn) {
    if (this._events[event]) {
      this._events[event] = this._events[event].filter(f => f !== fn);
    }
    return this;
  }
  emit(event, ...args) {
    if (this._events[event]) {
      this._events[event].forEach(fn => {
        try { fn(...args); } catch (e) { console.error(e); }
      });
    }
  }
}

class ChildProcessShim extends SimpleEmitter {
  constructor(bin, args, options) {
    super();
    this.bin = bin;
    this.args = args;
    this.options = options;

    this.stdout = new SimpleEmitter();
    this.stdout.setEncoding = () => this.stdout;

    this.stderr = new SimpleEmitter();
    this.stderr.setEncoding = () => this.stderr;

    this.kill = () => {};

    // Execute via Electrobun RPC in next tick
    queueMicrotask(async () => {
      try {
        if (typeof window !== "undefined" && window.__postbirdRpc && window.__postbirdRpc.spawnProcess) {
          const res = await window.__postbirdRpc.spawnProcess({ bin, args, options });
          if (res.stdout) {
            this.stdout.emit("data", res.stdout);
          }
          if (res.stderr) {
            this.stderr.emit("data", res.stderr);
          }
          this.emit("close", res.code ?? 0);
        } else {
          console.warn("[child_process.spawn - RPC not ready, fallback close]", bin);
          this.emit("close", 0);
        }
      } catch (err) {
        console.error("[child_process.spawn RPC Error]", err);
        this.emit("error", err);
      }
    });
  }
}

module.exports = {
  exec: (cmd, cb) => {
    console.warn("[child_process.exec fallback]", cmd);
    if (cb) cb(null, "", "");
  },
  spawn: (bin, args, options) => {
    return new ChildProcessShim(bin, args, options);
  },
};
