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

class Client extends SimpleEmitter {
  constructor(config) {
    super();
    this.config = config;
  }

  escapeIdentifier(str) {
    return '"' + (str || '').replace(/"/g, '""') + '"';
  }

  escapeLiteral(str) {
    return "'" + (str || '').replace(/'/g, "''") + "'";
  }

  query(options, callback) {
    let sql = typeof options === 'string' ? options : (options && options.text ? options.text : options);
    let values = options && options.values ? options.values : [];
    if (typeof values === 'function') {
      callback = values;
      values = [];
    }

    const promise = (async () => {
      if (window.__postbirdRpc && window.__postbirdRpc.query) {
        return await window.__postbirdRpc.query(sql, this.config);
      }
      console.warn("[pg.query fallback - RPC not ready]", sql);
      return { rows: [], fields: [], rowCount: 0, command: 'SELECT' };
    })();

    if (callback) {
      promise
        .then((res) => callback(null, res))
        .catch((err) => callback(err));
    }

    return promise;
  }

  end(callback) {
    if (callback) callback();
    return Promise.resolve();
  }
}

class Pool extends SimpleEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.ended = false;
  }

  query(options, values, callback) {
    if (typeof values === 'function') {
      callback = values;
      values = [];
    }

    let sql = typeof options === 'string' ? options : (options && options.text ? options.text : options);

    const promise = (async () => {
      if (window.__postbirdRpc && window.__postbirdRpc.query) {
        return await window.__postbirdRpc.query(sql, this.config);
      }
      console.warn("[pg.Pool.query fallback - RPC not ready]", sql);
      return { rows: [], fields: [], rowCount: 0, command: 'SELECT' };
    })();

    if (callback) {
      promise
        .then((res) => callback(null, res))
        .catch((err) => callback(err));
    }

    return promise;
  }

  connect(callback) {
    const client = new Client(this.config);
    const release = () => {};
    if (callback) {
      callback(null, client, release);
    }
    return Promise.resolve(client);
  }

  end(callback) {
    this.ended = true;
    if (callback) callback();
    return Promise.resolve();
  }
}

const types = {
  setTypeParser: () => {},
  getTypeParser: () => (v) => v,
};

module.exports = {
  Client,
  Pool,
  types,
};
