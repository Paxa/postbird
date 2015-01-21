/* Not ready, see spec file */

global.SqlSplitter = jClass.extend({
  state: 'open', // open | close
  context: 'query', // query, sq_const, dq_const, coment
  sql: '',

  init: function (sqlCode) {
    this.sqlCode = sqlCode;
  },

  split: function () {
    //console.log("processing:", this.sqlCode);

    var sqlCode = this.sqlCode;
    var pos = 0;
    var result = [];

    var startSt = 0;

    var endOfConst = function (quote) {
      while (this.sqlCode[pos] != quote && this.sqlCode[pos - 1] != '\\') {
        pos += 1
      }
    }.bind(this);

    var findAndGo = function (searchble) {
      var foundPos = this.sqlCode.indexOf(searchble, pos);
      pos = foundPos;
    }.bind(this);

    for(pos = 0; pos < this.sqlCode.length; pos++) {
      var ch = this.sqlCode[pos];
      //console.log("ch", pos, ch);

      if (ch == "'") {
        pos += 1;
        endOfConst("'");
        continue;
      }

      if (ch == '"') {
        pos += 1;
        endOfConst('"');
        continue;
      }

      //console.log(this.sqlCode.slice(pos - 3, pos));
      if (this.sqlCode.slice(pos - 3, pos) == "-- ") {
        findAndGo("\n");
        continue;
      }

      if (this.sqlCode.slice(pos - 2, pos) == "/*") {
        findAndGo("*/");
        continue;
      }

      if (ch == ";") {
        //console.log("extract", this.sqlCode.slice(startSt, pos));
        result.push(this.sqlCode.slice(startSt, pos).trim());
        //console.log("startSt", startSt, pos + 1);
        startSt = pos + 1;
      }
    }

    if (startSt < this.sqlCode.length) {
      result.push(this.sqlCode.substring(startSt, this.sqlCode.length - startSt).trim());
    }

    return result;
  }
});

window.SqlSplitter = global.SidebarResize;