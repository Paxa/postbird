require('./test_helper');

describe("Model.Trigger", () => {

  before(async () => {
    await testConnection();
  });

  afterEach(async () => {
    await cleanupSchema();
  });

  it("decodeTgType", () => {
    // Test known PostgreSQL bitflags for triggers:
    // bit 0 (1): row, bit 1 (2): before, bit 2 (4): insert
    var desc = Model.Trigger.decodeTgType(7); // 1 + 2 + 4 = row + before + insert
    assert.deepEqual(desc, ["row", "before", "insert"]);

    var updateAfter = Model.Trigger.decodeTgType(1 + 16); // row + update (after)
    assert.deepEqual(updateAfter, ["row", "update"]);
  });

  it("findAll and drop trigger", async () => {
    // 1. Create table
    await ModelBase.q("CREATE TABLE items (id serial primary key, name text);");

    // 2. Create trigger function
    var funcSql = `
      CREATE OR REPLACE FUNCTION items_trigger_fn()
      RETURNS trigger AS $$
      BEGIN
        NEW.name = UPPER(NEW.name);
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;
    await ModelBase.q(funcSql);

    // 3. Create trigger
    var triggerSql = `
      CREATE TRIGGER before_insert_item
      BEFORE INSERT ON items
      FOR EACH ROW EXECUTE PROCEDURE items_trigger_fn();
    `;
    await ModelBase.q(triggerSql);

    // 4. Find all triggers
    var triggers: any = await Model.Trigger.findAll();
    assert.ok(Array.isArray(triggers));
    var myTrigger = triggers.find(t => t.name == "before_insert_item");
    assert.ok(myTrigger, "Trigger before_insert_item should be found");
    assert.equal(myTrigger.table_name, "items");
    assert.equal(myTrigger.proc_name, "items_trigger_fn");

    var desc = myTrigger.typeDesc();
    assert.ok(desc.includes("row"));
    assert.ok(desc.includes("before"));
    assert.ok(desc.includes("insert"));

    // 5. Drop trigger
    await myTrigger.drop();

    // 6. Verify dropped
    var triggersAfterDrop: any = await Model.Trigger.findAll();
    var found = triggersAfterDrop.find(t => t.name == "before_insert_item");
    assert.equal(found, undefined);
  });

});
