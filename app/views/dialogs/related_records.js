/*::
interface RelatedRecords_QueryOptions {
  schema: string
  table: string
  column: string
  value: string
}
*/

class RelatedRecords extends DialogBase {
  /*::
  data: any[]
  queryOptions: RelatedRecords_QueryOptions
  */
  constructor (handler, data, queryOptions) {
    super(handler, {
      dialogClass: "related-records-dialog",
      title: "Related Records",
      data: data,
      queryOptions: queryOptions
    });
    this.showWindow();
  }

  showWindow () {
    var nodes = App.renderView('dialogs/related_records', {
      data: this.data
    });
    this.content = this.renderWindow(this.title, nodes);
    this.content.find('button.ok').bind('click', () => {
      this.applyFilters();
    });
  }

  applyFilters () {
    this.handler.openContentTabWithFilter(
      this.queryOptions.schema,
      this.queryOptions.table,
      this.queryOptions.column,
      this.queryOptions.value
    );
    this.close();
  }
}

/*::
declare var RelatedRecords__: typeof RelatedRecords
*/
module.exports = RelatedRecords;
