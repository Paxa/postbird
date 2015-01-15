describe('SqlImporter', do

  it("split by ;", do
    var instance = new SqlSplitter("select 1;select 2;");
    var queries = instance.split();
    assert(queries, ["select 1", "select 2"]);
  end)

  it("should handle quotes", do
    var instance = new SqlSplitter("select 1 ';select 2;'");
    var queries = instance.split();
    assert(queries, ["select 1 ';select 2;'"]);
  end)

  it("should handle comments", do
    var instance = new SqlSplitter("select 1; -- some comment\nselect 2;");
    var queries = instance.split();
    assert(queries, ["select 1", "-- some comment\nselect 2"]);
  end)

  it("should handle multiline comments", do
    var instance = new SqlSplitter("select 1; select 2 /* comment with quotes and \"'; */ ;");
    var queries = instance.split();
    assert(queries, ["select 1", "select 2 /* comment with quotes and \"'; */ ;"]);
  end)

end)