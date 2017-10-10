const ModelVanillaBase = require('./base');
const semver = require('semver');

class Server extends ModelVanillaBase {

  constructor(connection) {
    super();
    this.connectionObj = connection;
  }

  supportMatViews() {
    return semver.gt(this.connectionObj._serverVersion, "9.3.0");
  }

  fetchServerVersion(callback) {
    return new Promise((resolve, reject) => {
      this.query('SELECT version()', (result, error) => {
        if (error) {
          reject(error);
        } else {
          var version = result.rows[0].version;
          resolve(version);
          callback && callback(version);
        }
      });
    });
  }

  listDatabases(callback) {
    var databases = [];
    return new Promise((resolve, reject) => {
      this.query('SELECT datname FROM pg_database WHERE datistemplate = false order by datname;', (rows, error) => {
        if (error) {
          reject(error);
        }

        rows.rows.forEach((dbrow) => {
          databases.push(dbrow.datname);
        });
        resolve(databases);
        callback && callback(databases);
      });
    });
  }

  databaseTemplatesList(callback) {
    var templetes = [];
    return new Promise((resolve, reject) => {
      this.query('SELECT datname FROM pg_database WHERE datistemplate = true;', (rows, error) => {
        if (error) reject(error);

        rows.rows.forEach((dbrow) => {
          templetes.push(dbrow.datname);
        });
        resolve(templetes);
        callback && callback(templetes);
      });
    });
  }

  avaliableEncodings(callback) {
    var encodings = [];
    return new Promise((resolve, reject) => {
      this.query('select pg_encoding_to_char(i) as encoding from generate_series(0,100) i', (rows, error) => {
        if (error) reject(error);

        rows.rows.forEach((dbrow) => {
          if (dbrow.encoding != '') encodings.push(dbrow.encoding);
        });
        resolve(encodings);
        callback && callback(encodings);
      });
    });
  }

  getVariable(variable, callback) {
    return new Promise((resolve, reject) => {
      this.q(`show ${variable}`, (data, error) => {
        if (error) reject(error);

        var vname = Object.keys(data.rows[0])[0];
        resolve(data.rows[0][vname]);
        callback && callback(data.rows[0][vname]);
      });
    });
  }

  createDatabase(dbname, template, encoding, callback) {
    var sql = `CREATE DATABASE ${dbname}`;
    if (encoding) sql += " ENCODING '" + encoding + "'";
    if (template) sql += " TEMPLATE " + template;
    return this.q(sql, callback);
  }

  dropDatabase(dbname, callback) {
    return this.connectionObj.switchDb('postgres').then(() => {
      return this.q('drop database "%s"', dbname, (result, error) => {
        callback && callback(result, error);
      });
    });
  }

  renameDatabase(dbname, newDbname, callback) {
    return this.connectionObj.switchDb('postgres').then(() => {
      var sql = 'ALTER DATABASE "%s" RENAME TO "%s";'
      return this.q(sql, dbname, newDbname).then((result, error) => {
        return this.connectionObj.switchDb(error ? dbname : newDbname, () => {
          callback && callback(result, error);
        });
      });
    });
  }
}

module.exports = Server;
