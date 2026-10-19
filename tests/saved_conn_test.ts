require('./test_helper');

describe('SavedConn', () => {

  before(() => {
    window.localStorage.clear();
  });

  it("should create connection", () => {
    var conn = {database: "postbird", username: "bird"};
    Model.SavedConn.saveConnection("test1", conn);

    assert.deepEqual(Model.SavedConn.savedConnection("test1"), conn);
  });

  it("should compare settings", () => {
    var conn = {database: "postbird", username: "bird"};
    Model.SavedConn.saveConnection("test1", conn);

    assert(Model.SavedConn.isEqualWithSaved("test1", conn));
    assert.false(Model.SavedConn.isEqualWithSaved("test1", {database: "postbird", username: "cat"}));
  })

});
