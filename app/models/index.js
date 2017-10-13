class Index extends Model.base {
  constructor (index_name) {
    super();
    this.table = index_name;
  }
}

module.exports = Index;
