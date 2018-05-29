import events = require("events");

declare global {
  class Model {
  }

  export module Model {
    class Server extends Server__ {}

    class SavedConn extends SavedConn__ { }

    class Table extends Table__ { }

    class User extends User__ { }

    class Index extends Index__ { }

    class Column extends Column__ { }

    class Procedure extends Procedure__ { }
  }
}
