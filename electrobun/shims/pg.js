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

function rehydrateBuffers(rows) {
  if (!Array.isArray(rows) || !window.Buffer) return;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (Array.isArray(row)) {
      for (let c = 0; c < row.length; c++) {
        if (row[c] && row[c].type === 'Buffer' && Array.isArray(row[c].data)) {
          row[c] = window.Buffer.from(row[c].data);
        }
      }
    } else if (row && typeof row === 'object') {
      for (const k in row) {
        if (row[k] && row[k].type === 'Buffer' && Array.isArray(row[k].data)) {
          row[k] = window.Buffer.from(row[k].data);
        }
      }
    }
  }
}

function executeShimQuery(config, options, valuesOrCallback, callback, label) {
  let values = valuesOrCallback;
  let cb = callback;
  if (typeof valuesOrCallback === 'function') {
    cb = valuesOrCallback;
    values = [];
  }
  if (!Array.isArray(values)) {
    values = (options && Array.isArray(options.values)) ? options.values : [];
  }

  const sql = typeof options === 'string' ? options : (options && options.text ? options.text : options);
  const queryOptions = {
    ...(typeof options === 'object' && options?.rowMode ? { rowMode: options.rowMode } : {}),
    ...(values.length > 0 ? { values } : {}),
  };

  const promise = (async () => {
    if (window.__postbirdRpc && window.__postbirdRpc.query) {
      const res = await window.__postbirdRpc.query(sql, config, queryOptions);
      if (res && res.rows) {
        rehydrateBuffers(res.rows);
      }
      return res;
    }
    console.warn(`[${label} fallback - RPC not ready]`, sql);
    return { rows: [], fields: [], rowCount: 0, command: 'SELECT' };
  })();

  if (typeof cb === 'function') {
    promise
      .then((res) => cb(null, res))
      .catch((err) => cb(err));
  }

  return promise;
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

  query(options, values, callback) {
    return executeShimQuery(this.config, options, values, callback, 'pg.query');
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
    return executeShimQuery(this.config, options, values, callback, 'pg.Pool.query');
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
    const promise = (async () => {
      if (window.__postbirdRpc && typeof window.__postbirdRpc.disconnect === 'function') {
        try {
          await window.__postbirdRpc.disconnect(this.config);
        } catch (e) {
          console.warn("[pg.Pool.end RPC disconnect error]", e);
        }
      }
    })();

    if (callback) {
      promise.then(() => callback()).catch(() => callback());
    }
    return promise;
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
