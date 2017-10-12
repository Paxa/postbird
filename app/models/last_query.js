var LastQuery = {

  load: () => {
    return window.localStorage.lastQuery;
  },

  save: (value) => {
    return window.localStorage.lastQuery = value;
  }

}

module.exports = LastQuery;
