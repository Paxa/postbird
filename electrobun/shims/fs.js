class MockWriteStream {
  constructor(path) {
    this.path = path;
    this.writable = true;
    this._events = {};
    this._writableState = {
      ended: false,
      ending: false,
      finished: false,
      writing: false,
      length: 0,
      corked: 0,
      pendingcb: 0,
    };
    this.chunks = [];
  }
  on(event, fn) {
    (this._events[event] = this._events[event] || []).push(fn);
    return this;
  }
  once(event, fn) {
    const wrapper = (...args) => {
      this.removeListener(event, wrapper);
      fn(...args);
    };
    return this.on(event, wrapper);
  }
  emit(event, ...args) {
    if (this._events[event]) {
      this._events[event].forEach(fn => {
        try { fn(...args); } catch (e) { console.error(e); }
      });
    }
    return true;
  }
  removeListener(event, fn) {
    if (this._events[event]) {
      this._events[event] = this._events[event].filter(f => f !== fn);
    }
    return this;
  }
  write(chunk, encoding, cb) {
    if (typeof encoding === "function") { cb = encoding; encoding = null; }
    if (chunk !== undefined && chunk !== null) {
      const str = typeof chunk === "string" ? chunk : (chunk.toString ? chunk.toString() : String(chunk));
      this.chunks.push(str);
    }
    if (cb) cb();
    return true;
  }
  end(chunk, encoding, cb) {
    if (typeof chunk === "function") { cb = chunk; chunk = null; }
    if (chunk) this.write(chunk, encoding);
    this.writable = false;
    this._writableState.finished = true;
    this._writableState.ended = true;
    const content = this.chunks.join("");
    console.log(`[FS Shim] Written stream to ${this.path} (${content.length} bytes)`);
    if (typeof window !== "undefined") {
      window.__lastWrittenFiles = window.__lastWrittenFiles || {};
      window.__lastWrittenFiles[this.path] = content;
    }
    setTimeout(() => {
      this.emit("finish");
      this.emit("close");
      if (cb) cb();
    }, 10);
    return this;
  }
}

module.exports = {
  existsSync: (path) => {
    if (typeof path === 'string' && path.includes('cache.js')) return true;
    if (typeof window !== "undefined" && window.__lastWrittenFiles && window.__lastWrittenFiles[path]) return true;
    return false;
  },
  readFileSync: (path) => {
    if (typeof window !== "undefined" && window.__lastWrittenFiles && window.__lastWrittenFiles[path]) {
      return window.__lastWrittenFiles[path];
    }
    return "";
  },
  writeFileSync: (path, data) => {
    if (typeof window !== "undefined") {
      window.__lastWrittenFiles = window.__lastWrittenFiles || {};
      window.__lastWrittenFiles[path] = data;
    }
  },
  readdirSync: () => [],
  statSync: () => ({ isDirectory: () => false }),
  mkdirSync: () => {},
  createWriteStream: (path) => new MockWriteStream(path),
};
