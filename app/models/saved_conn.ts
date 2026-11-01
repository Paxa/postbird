class SavedConn {

  static savedConnections () {
    if (window.localStorage.savedConnections) {
      return JSON.parse(window.localStorage.savedConnections);
    } else {
      return {};
    }
  }

  static saveConnection (name, options) {
    var newData = this.savedConnections();
    newData[name] = options;
    window.localStorage.savedConnections = JSON.stringify(newData);
    this.syncToFile(newData);
  }

  static hasConnection(name) {
    return !!this.savedConnections()[name];
  }

  static renameConnection (oldName, newName) {
    var data = this.savedConnections();
    data[newName] = data[oldName];
    delete data[oldName];
    window.localStorage.savedConnections = JSON.stringify(data);
    this.syncToFile(data);
    return true;
  }

  static removeConnection (name) {
    var data = this.savedConnections();
    delete data[name];
    window.localStorage.savedConnections = JSON.stringify(data);
    this.syncToFile(data);
    return true;
  }

  static savedConnection (name) {
    return this.savedConnections()[name];
  }

  static isEqualWithSaved(name, options) {
    // add default field type=standard
    options = Object.assign({type: 'standard'}, options);
    var savedVal = Object.assign({type: 'standard'}, this.savedConnection(name));
    return JSON.stringify(savedVal) == JSON.stringify(options);
    //return Object.is(this.savedConnection(name), options);
  }

  static syncToFile(connections: Record<string, any>) {
    if (typeof window !== "undefined" && (window as any).__postbirdRpc && (window as any).__postbirdRpc.saveSavedConnections) {
      (window as any).__postbirdRpc.saveSavedConnections({ connections }).catch((err: any) => {
        console.error("[SavedConn] Failed to sync to disk:", err);
      });
    }
  }

  static async loadAndMigrate(): Promise<boolean> {
    if (typeof window !== "undefined" && (window as any).__postbirdRpc && (window as any).__postbirdRpc.loadSavedConnections) {
      try {
        const { connections, source } = await (window as any).__postbirdRpc.loadSavedConnections();
        const current = this.savedConnections();
        const currentCount = Object.keys(current).length;

        if (connections && Object.keys(connections).length > 0) {
          if (currentCount === 0) {
            window.localStorage.savedConnections = JSON.stringify(connections);
            console.log(`[SavedConn] Restored ${Object.keys(connections).length} connection(s) from ${source}`);
            return true;
          } else {
            // Merge existing local profiles with disk/migrated profiles
            let addedCount = 0;
            const merged = { ...connections, ...current };
            for (const k of Object.keys(connections)) {
              if (!current[k]) addedCount++;
            }
            window.localStorage.savedConnections = JSON.stringify(merged);
            this.syncToFile(merged);
            return addedCount > 0;
          }
        } else if (currentCount > 0) {
          // If we have local connections but no disk file yet, write them out
          this.syncToFile(current);
        }
      } catch (err) {
        console.error("[SavedConn] Error during connection loading/migration:", err);
      }
    }
    return false;
  }

  static parseConnectionsFromBuffer(buf: Buffer): Record<string, any> | null {
    let latestResult: Record<string, any> | null = null;

    // 1. Scan UTF-8 key
    const keyUtf8 = Buffer.from("savedConnections");
    let idx = 0;
    while ((idx = buf.indexOf(keyUtf8, idx)) !== -1) {
      const searchSlice = buf.subarray(idx, Math.min(buf.length, idx + 100));
      const braceIdx = searchSlice.indexOf(0x7b); // '{'
      if (braceIdx !== -1) {
        const start = idx + braceIdx;
        let depth = 0, inString = false, escape = false, end = -1;
        for (let i = start; i < buf.length; i++) {
          const c = buf[i];
          if (escape) { escape = false; continue; }
          if (c === 0x5c) { escape = true; continue; }
          if (c === 0x22) { inString = !inString; continue; }
          if (!inString) {
            if (c === 0x7b) depth++;
            else if (c === 0x7d) {
              depth--;
              if (depth === 0) { end = i + 1; break; }
            }
          }
        }
        if (end !== -1) {
          try {
            const parsed = JSON.parse(buf.subarray(start, end).toString("utf8"));
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
              latestResult = parsed;
            }
          } catch (e) {}
        }
      }
      idx += keyUtf8.length;
    }

    // 2. Scan UTF-16LE key
    const keyUtf16 = Buffer.from("savedConnections", "utf16le");
    idx = 0;
    while ((idx = buf.indexOf(keyUtf16, idx)) !== -1) {
      const searchSlice = buf.subarray(idx, Math.min(buf.length, idx + 100));
      for (let j = 0; j < searchSlice.length - 1; j++) {
        if (searchSlice[j] === 0x7b && searchSlice[j + 1] === 0x00) {
          const start = idx + j;
          let depth = 0, inString = false, escape = false, end = -1;
          for (let i = start; i < buf.length - 1; i += 2) {
            const c0 = buf[i];
            const c1 = buf[i + 1];
            if (c1 !== 0x00) break;
            if (escape) { escape = false; continue; }
            if (c0 === 0x5c) { escape = true; continue; }
            if (c0 === 0x22) { inString = !inString; continue; }
            if (!inString) {
              if (c0 === 0x7b) depth++;
              else if (c0 === 0x7d) {
                depth--;
                if (depth === 0) { end = i + 2; break; }
              }
            }
          }
          if (end !== -1) {
            try {
              const parsed = JSON.parse(buf.subarray(start, end).toString("utf16le"));
              if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                latestResult = parsed;
              }
            } catch (e) {}
          }
          break;
        }
      }
      idx += keyUtf16.length;
    }

    return latestResult;
  }
}


declare var SavedConn__: typeof SavedConn


module.exports = SavedConn;
