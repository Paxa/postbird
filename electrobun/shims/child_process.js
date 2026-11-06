class SimpleEmitter {
  constructor() {
    this._events = {};
    this._buffer = [];
    this._isClosed = false;
  }
  on(event, fn) {
    (this._events[event] = this._events[event] || []).push(fn);
    if (event === "data" && this._buffer.length > 0) {
      const items = [...this._buffer];
      this._buffer = [];
      items.forEach(it => {
        try { fn(it); } catch (e) { console.error(e); }
      });
    }
    if ((event === "close" || event === "end") && this._isClosed) {
      try { fn(); } catch (e) { console.error(e); }
    }
    return this;
  }
  removeListener(event, fn) {
    if (this._events[event]) {
      this._events[event] = this._events[event].filter(f => f !== fn);
    }
    return this;
  }
  emit(event, ...args) {
    if (event === "data" && (!this._events["data"] || this._events["data"].length === 0)) {
      this._buffer.push(args[0]);
    }
    if (event === "close" || event === "end") {
      this._isClosed = true;
    }
    if (this._events[event]) {
      this._events[event].forEach(fn => {
        try { fn(...args); } catch (e) { console.error(e); }
      });
    }
    return this;
  }
  [Symbol.asyncIterator]() {
    const queue = [];
    let resolveNext = null;
    let isDone = false;
    let error = null;

    this.on("data", (chunk) => {
      if (resolveNext) {
        const r = resolveNext;
        resolveNext = null;
        r({ value: chunk, done: false });
      } else {
        queue.push(chunk);
      }
    });

    const finish = () => {
      isDone = true;
      if (resolveNext) {
        const r = resolveNext;
        resolveNext = null;
        r({ value: undefined, done: true });
      }
    };

    this.on("end", finish);
    this.on("close", finish);

    this.on("error", (err) => {
      error = err;
      if (resolveNext) {
        const r = resolveNext;
        resolveNext = null;
        r(Promise.reject(err));
      }
    });

    return {
      next: () => {
        if (error) return Promise.reject(error);
        if (queue.length > 0) {
          return Promise.resolve({ value: queue.shift(), done: false });
        }
        if (isDone) {
          return Promise.resolve({ value: undefined, done: true });
        }
        return new Promise((resolve) => {
          resolveNext = resolve;
        });
      }
    };
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
          this.stdout.emit("end");
          this.stdout.emit("close");
          this.stderr.emit("end");
          this.stderr.emit("close");
          this.emit("close", res.code ?? 0);
        } else {
          console.warn("[child_process.spawn - RPC not ready, fallback close]", bin);
          this.stdout.emit("end");
          this.stdout.emit("close");
          this.stderr.emit("end");
          this.stderr.emit("close");
          this.emit("close", 0);
        }
      } catch (err) {
        console.error("[child_process.spawn RPC Error]", err);
        this.stdout.emit("error", err);
        this.emit("error", err);
        this.emit("close", 1);
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
