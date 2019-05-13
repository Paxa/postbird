import events = require("events");

declare global {
  export class Pane {
  }

  export module Pane {
    class Content    extends Content__ {}
    class Extensions extends Extensions__ { }
    class Procedures extends Procedures__ { }
    class Info       extends Info__ { }
    class Query      extends Query__ { }
    class Structure  extends Structure__ { }
    class Users      extends Users__ { }
  }
}
