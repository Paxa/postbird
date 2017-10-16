var Application = require('spectron').Application;
global.assert = require('../tests/assert_extras');

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('application launch', function () {
  this.timeout(10000)

  var app, client;

  before(() => {
    app = new Application({
      path: './node_modules/.bin/electron',
      args: ['main.js', `postgres://localhost:${process.env.PG_PORT || '5432'}/integration_test`],
      env: {NW_DEV: "true"}
    })

    return app.start().then((result) => {
      client = app.client;
      app.client.getMainProcessLogs().then(logs => {
        logs.forEach(log => {
          console.log(log)
        })
      })

      app.client.getRenderProcessLogs().then(logs => {
        logs.forEach(log => {
          console.log(`${log.level} ${log.message} -> ${log.source}`);
        })
      })

      return client.execute(() => {
        try {
          var connection = Connection.instances[0];
          return connection.query("drop schema public cascade; create schema public;").then(() => {
            return App.tabs[0].instance.fetchTablesAndSchemas();
          })
        } catch (error) {
          console.error(error);
        }
      }).then(() => {
        return Promise.resolve(result)
      }).catch(error => {
        console.error(error);
      });
    })
  })

  after(() => {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  it('shows an initial window', async () => {
    var title = await client.getTitle();
    assert.equal(title, 'Postbird');

    var count = await client.getWindowCount();
    assert.equal(count, 1);
  })

  it('should create new table dialog', async () => {
    await client.waitForValue('.sidebar .databases select', 5000);

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