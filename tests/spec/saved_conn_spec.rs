require "../../app/models/saved_conn"

describe('SavedConn', do

  bdd.after(do
    window.localStorage.clear();
  end)

  it("should create connection", do
    var conn = {database: "postbird", username: "bird"};
    Model.SavedConn.saveConnection("test1", conn);

    assert(Model.SavedConn.savedConnection("test1"), conn);
  end)

  it("should compare settings", do
    var conn = {database: "postbird", username: "bird"};
    Model.SavedConn.saveConnection("test1", conn);

    assert_true(Model.SavedConn.isEqualWithSaved("test1", conn));
    assert_false(Model.SavedConn.isEqualWithSaved("test1", {database: "postbird", username: "cat"}));
  end)

end)
