require "../../lib/psql_runner"
require "../../lib/sql_importer"

describe('PsqlRunner', do

  it("should import world database", do |done|
    var thisDir = node.path.dirname(module.filename);
    var worldDbPath = node.path.resolve(thisDir, "../../vendor/datasets/world.sql");

    var importer = new SqlImporter(worldDbPath, {debug: false});

    var onMessageCount = 0;
    var importerOutput = "";

    importer.onMessage(do |message, is_good|
      onMessageCount += 1;
      importerOutput += message;
      if !is_good
        console.log("IMPORT ERROR:" + message);
      end
    end)

    importer.doImport(global.connection, do |success|
      assert(success, true);
      //assert(onMessageCount, 17);

      Fiber(do
        var tables = Model.Table.wrapSync('publicTables')();
        assert(tables.sort(), ['city', 'country', 'countrylanguage'].sort());

        tables.forEach(do |table|
          Model.Table("", table).runSync("safeDrop");
        end)

        done();
      end).run()
    end);
  end)

  it("should import booktown database", do |done|
    var thisDir = node.path.dirname(module.filename);
    var worldDbPath = node.path.resolve(thisDir, "../../vendor/datasets/booktown.sql");

    var importer = new SqlImporter(worldDbPath, {debug: false});

    var onMessageCount = 0;
    var importerOutput = "";

    importer.onMessage(do |message, is_good|
      onMessageCount += 1;
      importerOutput += message;
      #if !is_good
      #  console.log("IMPORT ERROR:" + message);
      #end
    end)

    importer.doImport(global.connection, do |success|
      assert(success, true);

      //assert(onMessageCount, 101);

      Fiber(do
        var tables = Model.Table.wrapSync('publicTables')();
        assert(tables.sort(), ['states', 'my_list', 'employees', 'schedules', 'editions',
                              'books', 'publishers', 'shipments', 'stock', 'numeric_values',
                              'daily_inventory', 'money_example', 'customers', 'book_queue',
                              'stock_backup', 'stock_view', 'favorite_books', 'subjects',
                              'distinguished_authors', 'favorite_authors', 'text_sorting',
                              'alternate_stock', 'book_backup', 'recent_shipments', 'authors',
                              ].sort());

        tables.forEach(do |table|
          Model.Table("", table).runSync("safeDrop");
        end)

        done();
      end).run()
    end);
  end)

end)
