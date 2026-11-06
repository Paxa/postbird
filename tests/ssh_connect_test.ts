export {};
require('./test_helper');
const ssh2 = require('ssh2');
const nodeCrypto = require('crypto');
const nodeNet = require('net');
const SshConnectClient = require('../lib/ssh_connect');

declare var before: any;
declare var after: any;

describe('SshConnect', () => {
  let server: any;
  let sshPort: number;
  const activeClients: any[] = [];

  before(async () => {
    // Generate RSA PKCS#1 key for in-memory mock SSH server
    const { privateKey } = nodeCrypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    });

    server = new ssh2.Server({ hostKeys: [privateKey] }, (client: any) => {
      activeClients.push(client);
      client.on('authentication', (ctx: any) => {
        if (ctx.method === 'password' && ctx.username === 'postbird_tester' && ctx.password === 'secret_tunnel') {
          ctx.accept();
        } else {
          ctx.reject(['password']);
        }
      });

      client.on('request', (accept: any, reject: any, name: string) => {
        if (name === 'tcpip-forward') accept();
      });

      client.on('tcpip', (accept: any, reject: any, info: any) => {
        const stream = accept();
        const sock = nodeNet.connect(info.destPort, info.destIP, () => {
          stream.pipe(sock).pipe(stream);
        });
        sock.on('error', () => stream.end());
        stream.on('error', () => sock.destroy());
      });
    });

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        sshPort = server.address().port;
        resolve();
      });
    });
  });

  after(async () => {
    activeClients.forEach((c) => {
      try { c.end(); } catch (e) {}
    });
    if (server) {
      server.close();
    }
  });

  it('establishes SSH proxy tunnel and connects to PostgreSQL', async () => {
    const ssh = new SshConnectClient();
    const tunnel = await ssh.connectTo({
      ssh_host: '127.0.0.1',
      ssh_port: sshPort,
      ssh_user: 'postbird_tester',
      ssh_pass: 'secret_tunnel',
      host: 'localhost',
      port: 5432,
    });

    assert(tunnel && tunnel.port > 0, 'Tunnel should return a positive allocated port');

    // Connect PostgreSQL client through SSH tunnel local port
    const pg = require('../lib/sql_client');
    const client = new pg.Client({
      host: 'localhost',
      port: tunnel.port,
      user: process.env.USER || 'pavel',
      database: 'postbird_test',
    });

    await client.connect();
    const res = await client.query('SELECT 445566 AS tunnel_val;');
    assert.equal(res.rows[0].tunnel_val, 445566, 'Query through SSH proxy must return expected row data');
    await client.end();

    ssh.disconnect();
  });

  it('fails with descriptive error when SSH authentication fails', async () => {
    const ssh = new SshConnectClient();
    let failed = false;

    try {
      await ssh.connectTo({
        ssh_host: '127.0.0.1',
        ssh_port: sshPort,
        ssh_user: 'postbird_tester',
        ssh_pass: 'incorrect_password',
        host: 'localhost',
        port: 5432,
      });
    } catch (err: any) {
      failed = true;
      assert(err.message.includes('SSH Tunnel') || err.message.includes('authentication'), 'Error should mention SSH tunnel or authentication failure');
    }

    assert(failed, 'Should throw error when connecting with bad SSH password');
    ssh.disconnect();
  });

  it('connects via Connection using connection URL string with ssh_* params', async () => {
    const conn = new Connection();
    const user = process.env.PG_USER || process.env.USER || 'pavel';
    const url = `postgres://${user}@localhost:5432/postbird_test?ssh_host=127.0.0.1&ssh_port=${sshPort}&ssh_user=postbird_tester&ssh_pass=secret_tunnel`;

    await conn.connectToServer(url);
    assert(conn.sshConnection, 'SSH tunnel should be established on Connection');

    const res = await conn.query('SELECT 778899 AS ssh_url_val;');
    assert.equal(res.rows[0].ssh_url_val, 778899, 'Query over SSH URL connection should return expected value');

    await conn.close();
    assert(!conn.sshConnection, 'SSH tunnel should be disconnected after conn.close()');
  });

  it('connects via Connection using options object with url property containing ssh_* params (URL tab submission)', async () => {
    const conn = new Connection();
    const user = process.env.PG_USER || process.env.USER || 'pavel';
    const url = `postgres://${user}@localhost:5432/postbird_test?ssh_host=127.0.0.1&ssh_port=${sshPort}&ssh_user=postbird_tester&ssh_pass=secret_tunnel`;

    await conn.connectToServer({ type: 'url', url });
    assert(conn.sshConnection, 'SSH tunnel should be established on Connection');

    const res = await conn.query('SELECT 112233 AS ssh_obj_val;');
    assert.equal(res.rows[0].ssh_obj_val, 112233, 'Query over SSH URL options object should return expected value');

    await conn.close();
    assert(!conn.sshConnection, 'SSH tunnel should be disconnected after conn.close()');
  });

  it('connects via Connection with callback using URL containing ssh_* params', async () => {
    const conn = new Connection();
    const user = process.env.PG_USER || process.env.USER || 'pavel';
    const url = `postgres://${user}@localhost:5432/postbird_test?ssh_host=127.0.0.1&ssh_port=${sshPort}&ssh_user=postbird_tester&ssh_pass=secret_tunnel`;

    await new Promise<void>((resolve, reject) => {
      conn.connectToServer(url, async (success: boolean, error?: any) => {
        if (!success) return reject(error || new Error('Connection failed'));
        try {
          const res = await conn.query('SELECT 554433 AS cb_val;');
          assert.equal(res.rows[0].cb_val, 554433, 'Query through SSH callback flow should succeed');
          await conn.close();
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  });

  it('fails with descriptive error when connecting via URL with invalid SSH credentials', async () => {
    const conn = new Connection();
    const user = process.env.PG_USER || process.env.USER || 'pavel';
    const badUrl = `postgres://${user}@localhost:5432/postbird_test?ssh_host=127.0.0.1&ssh_port=${sshPort}&ssh_user=postbird_tester&ssh_pass=wrong_tunnel_pass`;

    let failedPromise = false;
    try {
      await conn.connectToServer(badUrl);
    } catch (err: any) {
      failedPromise = true;
      assert(err.message.includes('SSH Tunnel') || err.message.includes('authentication'), 'Error should mention SSH tunnel or authentication failure');
    }
    assert(failedPromise, 'Async connectToServer should throw on invalid SSH password in URL');

    const connCb = new Connection();
    let callbackFailed = false;
    await new Promise<void>((resolve) => {
      connCb.connectToServer(badUrl, (success: boolean, error?: any) => {
        assert(!success, 'Callback status should be false on SSH error');
        assert(error, 'Callback should receive an error object');
        assert.equal(error.sshStatus, 'Error', 'SSH status should be Error');
        assert.equal(error.dbStatus, 'Not attempted', 'DB status should be Not attempted');
        callbackFailed = true;
        resolve();
      });
    });
    assert(callbackFailed, 'Callback should be invoked with error status');
  });
});
