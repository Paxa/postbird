var SshConfig = require('ssh-config');
var SSHConnection = require('node-ssh-forward').SSHConnection;
var SSHOptions = require('node-ssh-forward').Options;
var fs = require('fs');
var net = require('net');
var childProcess = require('child_process');

class SshConnect_ {
  /*::
    sshConnection?: typeof SSHConnection
  */

  async connectTo(connectOptions) {
    var freePort = await this.getFreePort();

    var sshConfig = await this.loadConfig();
    var configFileValues = sshConfig[connectOptions.ssh_host] || {};

    var sshOptions /*: typeof SSHOptions */ = {
      endHost: configFileValues.HostName || connectOptions.ssh_host,
      noReadline: true,
      readyTimeout: 10000
    }

    if (configFileValues.User) {
      sshOptions.username = configFileValues.User
    }
    if (connectOptions.ssh_user) {
      sshOptions.username = configFileValues.User || connectOptions.ssh_user
    }
    if (connectOptions.ssh_pass) {
      sshOptions.password = connectOptions.ssh_pass
    }
    if (configFileValues.IdentityFile) {
      sshOptions.privateKey = configFileValues.IdentityFile
    }
    if (connectOptions.ssh_key) {
      sshOptions.privateKey = connectOptions.ssh_key
    }
    if (configFileValues.Port) {
      sshOptions.endPort = configFileValues.Port
    }
    if (connectOptions.ssh_port) {
      sshOptions.endPort = connectOptions.ssh_port
    }

    console.log('SSH connect', sshOptions)
    this.sshConnection = new SSHConnection(Object.assign({}, sshOptions))

    try {
      await this.sshConnection.forward({
        fromPort: freePort,
        toPort: connectOptions.port,
        toHost: connectOptions.host
      })
    } catch (err) {
      console.error(err)
      delete sshOptions.noReadline;
      var msg = `SSH Tunnel:\n${err.message}\n\n` +
                `Check connection params:\n${JSON.stringify(sshOptions, null, 2)}`
      throw new Error(msg)
    }

    return {
      host: '127.0.0.1',
      port: freePort
    }
  }

  disconnect() {
    console.log("Stopping ssh process...");
    if (this.sshConnection && this.sshConnection.shutdown) {
      this.sshConnection.shutdown();
    }
  }

  async loadConfig () {
    var configPath = `${process.env.HOME}/.ssh/config`;

    if (!(await this.fileExist(configPath))) {
      return {}
    }

    var content = await this.readFile(configPath);

    var config = SshConfig.parse(content.toString());

    var res = {};

    config.forEach(host => {
      if (host.param == 'Host') {
        if (Array.isArray(host.value)) {
          host.value = host.value[0];
        }
        res[host.value] = {};
        host.config.forEach(param => {
          if (param.param) {
            res[host.value][param.param] = param.value;
          }
        });
      }
    });

    //console.dir(res);
    return res;
  }

  async fileExist(file) {
    return await (new Promise((resolve, reject) => {
      fs.access(file, (err) => {
        if (err) {
          console.log("The file does not exist.", file, err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    }))
  }

  async readFile(file) {
    return await (new Promise((resolve, reject) => {
      fs.readFile(file, (err, data) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(data);
        }
      });
    }));
  }

  getFreePort () {
    return new Promise((resolve, reject) => {
      var server = net.createServer((sock) => { });
      server.listen(0, () => {
        var port = server.address().port;
        server.close(() => {
          resolve(port);
        });
      });
    });
  }


  // https://github.com/sindresorhus/is-port-reachable/blob/master/index.js

  async isPortOpen(port, timeout = 100) {
    const promise = new Promise(((resolve, reject) => {
      const socket = new net.Socket();

      const onError = () => {
        socket.destroy();
        reject();
      };

      socket.setTimeout(timeout);
      socket.once('error', onError);
      socket.once('timeout', onError);

      socket.connect(port, '127.0.0.1', () => {
        socket.end();
        resolve();
      });
    }));

    try {
      await promise;
      return true;
    } catch (e) {
      return false;
    }
  };

  /*

  disconnect() {
    console.log("Stopping ssh process...");
    if (this.process && this.process.kill) {
      this.process.kill();
    }
  }

  async connectTo_cmd(connectOptions) {
    var connectionError = false

    var sshHost = connectOptions.ssh_host;
    if (connectOptions.ssh_user) {
      sshHost = `${connectOptions.ssh_user}@${sshHost}`
    }
    if (connectOptions.ssh_port) {
      sshHost = `${sshHost} -p ${connectOptions.ssh_port}`
    }
    if (connectOptions.ssh_key) {
      sshHost = `${sshHost} -i ${connectOptions.ssh_key}`
    }

    var freePort = await this.getFreePort();

    var cmd = `-f -N -L ${freePort}:${connectOptions.host}:${connectOptions.port} ${sshHost} -o ExitOnForwardFailure=yes -o ConnectTimeout=8`;
    console.log(`Running ${cmd}`)
    this.process = childProcess.spawn('ssh', cmd.split(' '));

    this.process.stdout.on('data', (data) => {
      console.log(`ssh stdout: ${data}`);
    });

    this.process.stderr.on('data', (data) => {
      console.error(`ssh stderr: ${data}`);
      stdErr = stdErr + data + "\n"
    });

    var stdErr = ''
    this.process.on('close', (code) => {
      console.log(`ssh child process exited with code ${code}`);
      connectionError = true
    });

    var mainWindow = electron.remote.app.mainWindow;
    mainWindow.on('close', () => {
      console.log('closing ssh', cmd);
      logger.info('closing ssh ' + cmd);
      this.disconnect();
    });

    for (var n = 0; n < 100; n++) {
      if (connectionError) {
        throw new Error(`Command failed:\nssh ${cmd}\n\n${stdErr.trim()}`)
      }
      var isOpen = await this.isPortOpen(freePort);
      if (isOpen) {
        break
      }

      await this.wait(100);
    }

    if (connectionError) {
      console.log('connectionError', connectionError)
      throw new Error(`Command failed:\nssh ${cmd}\n\n${stdErr.trim()}`)
    } else {
      return {
        host: '127.0.0.1',
        port: freePort
      };
    }
  }

  async wait(timeMs) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, timeMs);
    });
  }
  */
}

module.exports = SshConnect_;

// postgresql://bills_autopay_registration:RdsePF383Aj7yTcK@10.18.1.31?ssh_host=10.18.1.31&ssh_user=pavel.evstigneev
// postgresql://bills_autopay_registration:RdsePF383Aj7yTcK@10.18.1.31?ssh_host=10.18.1.31&ssh_user=pavel.evstigneev

// postgres://ebox:8lOVapzJgcjsQT9JLCn7d2hFaMl1PnTU74P@159.69.46.22/ebox?ssh_host=ebox2
// postgres://partner_information_service:4zgXp0NkD2GomzmuenrQW1q6EAkoOnnN6aTgYAEB@10.14.61.101/partner_information_service_staging?ssh_host=10.14.61.101&ssh_user=pavel.evstigneev