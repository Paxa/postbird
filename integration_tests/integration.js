var Application = require('spectron').Application;
global.assert = require('../tests/assert_extras');

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});


var getMenuItemByNames = function (currMenu, ...names) {
  var parentLabels = [];
  var result = null;

  for (let name of names) {
    parentLabels.push(name);
    var foundMenu = null;
    for (var i = 0; i <= currMenu.getItemCount(); i++) {
      if (currMenu.getLabelAt(i) == name) {
        foundMenu = currMenu.items[i];
        console.log('found', parentLabels, foundMenu);
        break;
      }
    }
    if (foundMenu) {
      result = foundMenu;
      currMenu = foundMenu.submenu;
    } else {
      throw new Error(`Can not find item ${parentLabels.join(" -> ")}`);
    }
  }

  return result;
};


describe('application launch', function () {
  this.timeout(20000)

  var app, client, execSql;

  beforeEach(() => {
    app = new Application({
      path: './node_modules/.bin/electron',
      args: ['main.js', `postgres://localhost:${process.env.PG_PORT || '5432'}/integration_test`],
      env: {NW_DEV: "true"},
      startTimeout: 18000
    })

    var i = setInterval(function () {
      app.chromeDriver.getLogs().forEach(line => {
        console.log('chromeDriver:', line)
      })
      app.chromeDriver.clearLogs()
      if (!app.isRunning()) {
        clearInterval(i);
        return;
      }
    }, 100);

    return app.start().then((result) => {
      client = app.client;
      client.getMainProcessLogs().then(logs => {
        logs.forEach(log => {
          console.log(log)
        })
      })

      client.getRenderProcessLogs().then(logs => {
        logs.forEach(log => {
          console.log(`${log.level} ${log.message} -> ${log.source}`);
        })
      })

      execSql = (sql) => {
        return client.execute((sql) => {
          try {
            var connection = Connection.instances[0];
            return connection.query(sql).then(() => {
              return App.tabs[0].instance.fetchTablesAndSchemas();
            })
          } catch (error) {
            console.error(error);
          }
        }, sql).then(() => {
          return Promise.resolve(result)
        }).catch(error => {
          console.error(error);
        });
      }

      client.waitValueEq = async (selector, value, ms = 1000, debug = false) => {
        while (true) {
          var value = await client.getValue(selector);
          if (debug) {
            console.log("waitValueEq", selector, value);
          }
          if (value == value) break;
          await sleep(ms);
        }
      }

      /*
      client.execute(() => {
        process.on('unhandledRejection', (reason, p) => {
          console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
        });
      });
      */

      execSql("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    })
  })

  afterEach(async () => {
    if (app && app.isRunning()) {
      try {
        await app.stop()
      } catch (e) {
        console.error(e);
      }
    }
    return Promise.resolve(true);
  })

  it('shows an initial window', async () => {
    var title = await client.getTitle();
    assert.equal(title, 'Postbird');

    var count = await client.getWindowCount();
    assert.equal(count, 1);
  })

  it('should create and delete database', async () => {
    await execSql("DROP DATABASE IF EXISTS int_testing;");

    await client.waitForValue('.sidebar .databases select', 5000);

    await client.execute((_getMenuItemByNames) => {
      console.log(_getMenuItemByNames);
      eval('var getMenuItemByNames = ' + _getMenuItemByNames);
      var menu = electron.remote.Menu.getApplicationMenu();
      getMenuItemByNames(menu, 'Database', 'Create Database').click();
    }, getMenuItemByNames.toString());

    await client.waitForVisible('.alertify-dialog input[name="dbname"]', 10000);

    await client.setValue('.alertify-dialog input[name="dbname"]', 'int_testing');

    await client.click('.alertify-dialog button.ok');

    client.waitValueEq('.sidebar .databases select', "int_testing");

    // This will open dialog and block all window
    /*
    await client.execute(() => {
      var menu = electron.remote.Menu.getApplicationMenu();
      getMenuItemByNames(menu, 'Database', 'Drop Database').click();
    });

    client.waitValueEq('.sidebar .databases select', "", 1000, true);
    */
  })

  it('should create new table dialog', async () => {
    await client.waitForValue('.sidebar .databases select', 5000);

    await client.waitForVisible('a.addTable');

    client.click('a.addTable');
    await client.waitForVisible('.new-table-dialog select[name="tablespace"]');

    var options = await client.execute(() => {
      return Array.from(document.querySelectorAll('.new-table-dialog select[name="tablespace"] option')).map((option) => {
        return option.value;
      });
    });

    assert.deepEqual(options.value.sort(), ['public', 'pg_catalog', 'information_schema'].sort());

    await client.setValue('.new-table-dialog input[name=name]', 'test_table');

    await client.click('.new-table-dialog button.ok');

    await client.waitForVisible('.tables li[table-name="test_table"]')
  })

  it.skip('should install and uninstall extension', async () => {
    await client.waitForValue('.sidebar .databases select', 5000);

    client.click('[tab="extensions"]');

    await client.waitForVisible('.window-content.extensions button');
    client.click('.window-content.extensions button');

    await client.waitForVisible('#alertify-ok');
    client.click('#alertify-ok');

    await client.waitForVisible('.alertify-alert');
    var text = await client.getText('.alertify-alert');

    assert.match(text, /Extension .+ successfully installed./)

    client.click('#alertify-ok');

    await client.waitForVisible('.window-content.extensions button[exec^=uninstall]');
    client.click('.window-content.extensions button[exec^=uninstall]');

    await sleep(100);

    await client.waitForVisible('#alertify-ok');
    client.click('#alertify-ok');

    //await sleep(200);

    await client.waitForVisible('.alertify-alert .alertify-message');
    var uninstallText = await client.getText('.alertify-alert .alertify-message');

    assert.match(uninstallText, /Extension .* uninstalled./)
  })
})