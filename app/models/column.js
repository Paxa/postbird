global.Model.Column = Model.base.extend({
  init: function (data) {
    this._super(data);
    //this.is_primary_key = this. //
  }
});

Model.Column.availableTypes = function (callback) {
  sql = (function () { /*

    SELECT n.nspname as "schema",
      pg_catalog.format_type(t.oid, NULL) AS "name",
      pg_catalog.obj_description(t.oid, 'pg_type') as "description"
    FROM pg_catalog.pg_type t
         LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE (t.typrelid = 0 OR (SELECT c.relkind = 'c' FROM pg_catalog.pg_class c WHERE c.oid = t.typrelid))
      AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_type el WHERE el.oid = t.typelem AND el.typarray = t.oid)
      AND pg_catalog.pg_type_is_visible(t.oid)
    ORDER BY 1, 2;

  */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];

  Model.base.q(sql, function(data) {
    callback(data.rows);
  });
};
