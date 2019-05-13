class LastQuery {

  static load () {
    return window.localStorage.lastQuery;
  }

  static save (value) {
    return window.localStorage.lastQuery = value;
  }

}

/*::
declare var LastQuery__: typeof LastQuery
*/

module.exports = LastQuery;
