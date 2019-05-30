var semver = require('semver');

class Server extends ModelBase {

  constructor(connection) {
    super();
    this.connectionObj = connection;
  }

  supportMatViews() /*: boolean */ {
    return this.connectionObj.supportMatViews();
  }

  fetchServerVersion() /*: Promise<string> */ {
    return this.query('SELECT version()').then(result => {
      var version = result.rows[0].version;
      return Promise.resolve(version);
    });
  }

  listDatabases(callback /*:: ?: (dbs: string[]) => void */) {
    return this.query('SELECT datname FROM pg_database WHERE datistemplate = false order by datname;').then(rows => {
      var databases = rows.rows.map(dbrow => {
        return dbrow.datname;
      });
      callback && callback(databases);
      return Promise.resolve(databases);
    });
  }

  databaseTemplatesList() /*: Promise<string[]> */ {
    return this.query('SELECT datname FROM pg_database WHERE datistemplate = true;').then(rows => {
      var templetes = rows.rows.map(dbrow => {
        return dbrow.datname;
      });
      return Promise.resolve(templetes);
    });
  }

  avaliableEncodings() /*: Promise<string[]> */ {
    return this.query('select pg_encoding_to_char(i) as encoding from generate_series(0,100) i').then(result => {
      var encodings = [];
      result.rows.forEach((row) => {
        if (row.encoding != '') encodings.push(row.encoding);
      });
      return Promise.resolve(encodings);
    });
  }

  getVariable(variable) /*: Promise<string> */ {
    return this.q(`show ${variable}`).then(data => {
      var vname = Object.keys(data.rows[0])[0];
      return Promise.resolve(data.rows[0][vname]);
    });
  }

  createDatabase(dbname, template, encoding) {
    var sql = `CREATE DATABASE "${dbname}"`;
    if (encoding) sql += " ENCODING '" + encoding + "'";
    if (template) sql += " TEMPLATE " + template;
    return this.q(sql);
  }

  async dropDatabase(dbname) {
    await this.connectionObj.switchDb('postgres');
    return this.q('drop database "%s"', dbname);
  }

  async renameDatabase(dbname, newDbname) {
    await this.connectionObj.switchDb('postgres');
    var sql = 'ALTER DATABASE "%s" RENAME TO "%s";'
    try {
      await this.q(sql, dbname, newDbname);
      return this.connectionObj.switchDb(newDbname);
    } catch (error) {
      return this.connectionObj.switchDb(dbname);
    }
  }
}

/*::
declare var Server__: typeof Server
*/

module.exports = Server;
