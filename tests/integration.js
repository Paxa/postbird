var Application = require('spectron').Application
var assert = require('assert')

describe('application launch', function () {
  this.timeout(10000)

  var app, client;

  before(() => {
    app = new Application({
      path: './node_modules/.bin/electron',
      args: ['main.js', 'postgres://localhost/integration_test'],
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
          console.log(log.message)
          console.log(log.source)
          console.log(log.level)
        })
      })

      return client.execute(() => {
        try {
          var connection = Connection.instances[0];
          console.log(['connection', typeof connection, connection]);
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

  it('should show new table dialog', async () => {
    var result = await client.waitForValue('.sidebar .databases select', 5000);

    client.click('a.addTable');
    await client.waitForVisible('.new-table-dialog select[name="tablespace"]');

    var options = await client.execute(() => {
      return Array.from(document.querySelectorAll('.new-table-dialog select[name="tablespace"] option')).map((option) => {
        return option.value;
      });
    });

    assert.deepEqual(options.value, ['public', 'pg_catalog', 'information_schema']);

    await client.setValue('.new-table-dialog input[name=name]', 'test_table');

    await client.click('.new-table-dialog button.ok');

    await client.waitForVisible('.tables li[table-name="test_table"]')
  })
})