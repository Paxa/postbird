/*::
interface Structure_ExtraOptions {
  isMatView?: boolean
  columnsError?: string
  indexesError?: string
  constraintsError?: string
}
*/

class Structure extends PaneBase {

  /*::
    constraints: any[]
  */

  renderTab (columns, indexes, constraints, extra /*: Structure_ExtraOptions */ = {}) {
    if (extra.sequenceInfo) {
      this.renderViewToPane('structure', 'sequnece_structure_tab', {
        sequence: extra.sequenceInfo
      });
    } else {
      var neededConstraints = [];
      this.constraints = constraints ? constraints.rows : [];
      this.constraints.forEach((constraint) => {
        if (constraint.contype != "p") {
          neededConstraints.push(constraint);
        }
      });

      this.renderViewToPane('structure', 'structure_tab', {
        columns: columns,
        indexes: indexes,
        constraints: neededConstraints,
        isMatView: extra.isMatView,
        indexesError: extra.indexesError,
        columnsError: extra.columnsError,
        constraintsError: extra.constraintsError
      });
    }
    this.initTables();
  }

  addColumnForm () {
    new Dialog.NewColumn(this.handler);
  }

  addIndexForm () {
    new Dialog.NewIndex(this.handler);
  }

  editColumn (column_name) {
    new Dialog.EditColumn(this.handler, column_name);
  }

  deleteColumn (column_name) {
    var msg = `Delete column <b>${column_name}</b>?`;
    window.alertify.confirm(msg, (result) => {
      if (result) {
        this.doDeleteColumn(column_name);
      }
    });
  }

  async doDeleteColumn (column_name) {
    try {
      await this.handler.deleteColumn(column_name);
    } catch (error) {
      window.alert(error.message);
    }
  }

  deleteIndex (indexName) {
    var msg = `Delete index "${indexName}"?`;
    $u.confirm(msg, (result) => {
      if (result) {
        this.doDeleteIndex(indexName);
      }
    });
  }

  async doDeleteIndex (indexName) {
    try {
      await this.handler.deleteIndex(indexName);
    } catch (error) {
      $u.alert(error.message);
    }
  }

  deleteConstraint (constraintName) {
    var msg = `Delete constraint <b>${constraintName}</b>?`;
    var constraint = this.constraints.find((c) => { return c.conname == constraintName; });
    if (constraint) msg = msg + `<br><code>${constraint.pretty_source}</code>`;
    window.alertify.confirm(msg, (result) => {
      if (result) {
        this.handler.deleteConstraint(constraintName, (result, error) => {
          if (error) window.alert(error.message);
        });
      }
    });
  }
}

/*::
declare var Structure__: typeof Structure
*/

module.exports = Structure;
