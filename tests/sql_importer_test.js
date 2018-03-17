require("../lib/psql_runner")
require("../lib/sql_importer")

describe('SqlImporter', () => {

  before(async () => {
    await testConnection();
  });

  afterEach(async () => {
    await cleanupSchema();
  });

  it("should import world database", async () => {
    var thisDir = node.path.dirname(module.filename);
    var worldDbPath = node.path.resolve(thisDir, "../vendor/datasets/world.sql");

    var importer = new SqlImporter(worldDbPath, {debug: false});

    var onMessageCount = 0;
    var importerOutput = "";

    importer.onMessage((message, is_good) => {
      onMessageCount += 1;
      importerOutput += message;
      if (!is_good) {
        console.log("IMPORT ERROR:" + message);
      }
    })

    var result = await importer.doImport(getConnection());

    assert.ok(result);

    var tables = await TestHelper.publicTables();
    assert.deepEqual(tables, ['city', 'country', 'countrylanguage']);
  })

  it("should import booktown database", async () => {
    var thisDir = node.path.dirname(module.filename);
    var worldDbPath = node.path.resolve(thisDir, "../vendor/datasets/booktown.sql");

    var importer = new SqlImporter(worldDbPath, {debug: false});

    var onMessageCount = 0;
    var importerOutput = "";

    importer.onMessage((message, is_good) => {
      onMessageCount += 1;
      importerOutput += message;
      //if (!is_good) {
      //  console.log("IMPORT ERROR:" + message);
      //}
    })

    var result = await importer.doImport(getConnection());
    assert.ok(result);

    //assert(onMessageCount, 101);

    var tables = await TestHelper.publicTables();
    assert.deepEqual(tables.sort(),
      ['states', 'my_list', 'employees', 'schedules', 'editions',
        'books', 'publishers', 'shipments', 'stock', 'numeric_values',
        'daily_inventory', 'money_example', 'customers', 'book_queue',
        'stock_backup', 'stock_view', 'favorite_books', 'subjects',
        'distinguished_authors', 'favorite_authors', 'text_sorting',
        'alternate_stock', 'book_backup', 'recent_shipments', 'authors',
      ].sort()
    );
  })

})
