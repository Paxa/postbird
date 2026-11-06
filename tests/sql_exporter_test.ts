require('./test_helper');
require("../lib/pg_dump_runner");
require("../lib/psql_runner");
var SqlExporter = require("../lib/sql_exporter");
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('SqlExporter', () => {

  before(async () => {
    await testConnection();
  });

  afterEach(async () => {
    await cleanupSchema();
  });

  it("dump sql to stdout with full structure and data", async () => {
    var table = await Model.Table.create('public', 'test_table');

    await table.insertRow([1]);
    await table.insertRow([2]);
    await table.insertRow([3]);

    var exporter = new SqlExporter({debug: false});

    var result: any = await new Promise((resolve) => {
      exporter.doExport(getConnection(), (result, stdout, stderr) => {
        resolve({result, stdout, stderr});
      });
    });

    var dump = result.stdout.replace(/public\.test_table/g, 'test_table');
    assert.contain(dump, "PostgreSQL database dump");
    assert.contain(dump, "CREATE TABLE test_table");
    assert.contain(dump, "COPY test_table (id) FROM stdin;");

    await table.drop();
  });

  it("setOnlyStructure dumps schema only and omits data", async () => {
    var table = await Model.Table.create('public', 'schema_only_table');
    await table.insertRow([100]);

    var exporter = new SqlExporter({debug: false});
    exporter.setOnlyStructure();

    var result: any = await new Promise((resolve) => {
      exporter.doExport(getConnection(), (result, stdout, stderr) => {
        resolve({result, stdout, stderr});
      });
    });

    var dump = result.stdout;
    assert.contain(dump, "CREATE TABLE");
    assert.contain(dump, "schema_only_table");
    assert.notContain(dump, "COPY schema_only_table");
    assert.notContain(dump, "100");

    await table.drop();
  });

  it("setOnlyData dumps COPY rows and omits CREATE TABLE", async () => {
    var table = await Model.Table.create('public', 'data_only_table');
    await table.insertRow([999]);

    var exporter = new SqlExporter({debug: false});
    exporter.setOnlyData();

    var result: any = await new Promise((resolve) => {
      exporter.doExport(getConnection(), (result, stdout, stderr) => {
        resolve({result, stdout, stderr});
      });
    });

    var dump = result.stdout;
    assert.notContain(dump, "CREATE TABLE");
    assert.contain(dump, "COPY");
    assert.contain(dump, "999");

    await table.drop();
  });

  it("setNoOwners adds --no-owner flag", async () => {
    var exporter = new SqlExporter();
    exporter.setNoOwners();
    assert.ok(exporter.options.args.includes('--no-owner'));
  });

  it("onMessage fires stdout callback during export", async () => {
    var table = await Model.Table.create('public', 'msg_test_table');
    var exporter = new SqlExporter();

    let messages = "";
    exporter.onMessage((msg: string, is_stdout: boolean) => {
      if (is_stdout) {
        messages += msg;
      }
    });

    await exporter.doExport(getConnection());
    assert.contain(messages, "PostgreSQL database dump");

    await table.drop();
  });

  it("exports dump directly to a file on disk", async () => {
    var table = await Model.Table.create('public', 'file_export_table');
    await table.insertRow([42]);

    const tempFile = path.join(os.tmpdir(), `postbird_dump_test_${Date.now()}.sql`);

    var exporter = new SqlExporter();
    await exporter.doExport(getConnection(), tempFile);

    assert.ok(fs.existsSync(tempFile), "Dump file should exist on disk");
    const content = fs.readFileSync(tempFile, 'utf8');
    assert.contain(content, "file_export_table");
    assert.contain(content, "42");

    fs.unlinkSync(tempFile);
    await table.drop();
  });

  it("PgDumpRunner version() returns valid PostgreSQL version string", async () => {
    const runner = new PgDumpRunner();
    const ver = await runner.version();
    assert.ok(ver && typeof ver === 'string', "version() should return a string");
    assert.ok(/^\d+\.\d+/.test(ver), `Version "${ver}" should match semver prefix`);
  });

  it("PsqlRunner version() returns valid PostgreSQL version string", async () => {
    const runner = new PsqlRunner();
    const ver = await runner.version();
    assert.ok(ver && typeof ver === 'string', "version() should return a string");
    assert.ok(/^\d+\.\d+/.test(ver), `Version "${ver}" should match semver prefix`);
  });

});
