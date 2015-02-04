global.Model.LastQuery = jClass.extend({
  klassExtend: {
    load: function () {
      return window.localStorage.lastQuery;
    },

    save: function (value) {
      return window.localStorage.lastQuery = value;
    }
  }

});

