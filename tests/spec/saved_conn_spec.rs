require "../../app/models/saved_conn"

describe('SavedConn', do

  it("should create connection", do
    var conn = {database: "postbird", username: "bird"};
    Model.SavedConn.saveConnection("test1", conn);

    assert(Model.SavedConn.savedConnection("test1"), conn);
    window.localStorage.clear();
  end)

  it("should compare settings", do
    var conn = {database: "postbird", username: "bird"};
    Model.SavedConn.saveConnection("test1", conn);

    assert_true(Model.SavedConn.isEqualWithSaved("test1", conn));
    assert_false(Model.SavedConn.isEqualWithSaved("test1", {database: "postbird", username: "cat"}));
    window.localStorage.clear();
  end)

end)
