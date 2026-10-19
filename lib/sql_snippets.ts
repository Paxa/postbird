global.SqlSnippets = {
  'Create View': {
    sql: "CREATE VIEW vista AS SELECT text 'Hello World' AS hello;",
    description: "Create view"
  },

  'Alter View': {
    sql: "ALTER VIEW hello RENAME TO new_hello;",
    description: "Alter View"
  },

  'Drop View': {
    sql: "DROP VIEW hello;",
    description: "Drop view"
  },

  'Show Running Queries': {
    sql: "SELECT * FROM pg_stat_activity;",
    description: "Show all running queries"
  },

  'Kill Running Query': {
    description: "Stop running query",
    sql: `
select pg_cancel_backend(pid);
-- this one is like "kill -9 pid"
-- select pg_terminate_backend(pid)
`
  },

  "Users count connected to DB": {
    sql: "SELECT datname, numbackends FROM pg_stat_database",
    description: "Determining how many users are currently connected to the database"
  },

  "Databases Disk Usage": {
    sql: `SELECT d.datname AS Name,
pg_catalog.pg_get_userbyid(d.datdba) AS Owner,
pg_catalog.pg_size_pretty(pg_catalog.pg_database_size(d.datname)) as size
FROM pg_catalog.pg_database d
ORDER BY pg_catalog.pg_database_size(d.datname) desc;`,
    description: "List databases with their size on disk and owner"
  },

  "Find biggest relation": {
    sql: `SELECT nspname || '.' || relname AS "relation",
  pg_size_pretty(pg_relation_size(C.oid)) AS "size"
  FROM pg_class C
  LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace)
  WHERE nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  ORDER BY pg_relation_size(C.oid) DESC  LIMIT 30;`,
    description: ""
  },

  "Add column to a table": {
    sql: "ALTER TABLE table_name ADD column_name datatype;",
    description: ""
  },

  "Copy schema/structure of one table to another": {
    sql: "create table table_name_copy (like table_name including constraints);",
    description: ""
  },

  "Month based partitioning": {
    sql: `
-- Create the master table

CREATE TABLE test (
  id   bigserial PRIMARY KEY,
  TIME  TIMESTAMP
);

-- Create a function to create the partitions and indexes

-- drop function test_partition_creation();
CREATE OR REPLACE FUNCTION test_partition_creation( DATE, DATE )
returns void AS $$
DECLARE
  create_query text;
  index_query text;
BEGIN
  FOR create_query, index_query IN SELECT
      'create table test_'
      || TO_CHAR( d, 'YYYY_MM' )
      || ' ( check( time >= date '''
      || TO_CHAR( d, 'YYYY-MM-DD' )
      || ''' and time < date '''
      || TO_CHAR( d + INTERVAL '1 month', 'YYYY-MM-DD' )
      || ''' ) ) inherits ( test );',
      'create index test_'
      || TO_CHAR( d, 'YYYY_MM' )
      || '_time on test_'
      || TO_CHAR( d, 'YYYY_MM' )
      || ' ( time );'
    FROM generate_series( $1, $2, '1 month' ) AS d
  LOOP
    EXECUTE create_query;
    EXECUTE index_query;
  END LOOP;
END;
$$
language plpgsql;

-- Partition creation for a given time period

SELECT test_partition_creation( '2010-01-01', '2012-01-01' );

-- Trigger function creation

-- drop function test_partition_function();
CREATE OR REPLACE FUNCTION test_partition_function()
RETURNS TRIGGER AS $$
BEGIN
  EXECUTE 'insert into test_'
    || to_char( NEW.TIME, 'YYYY_MM' )
    || ' values ( $1, $2 )' USING NEW.id, NEW.TIME ;
  RETURN NULL;
END;
$$
LANGUAGE plpgsql;

-- Trigger activation

-- drop trigger test_partition_trigger;
CREATE TRIGGER test_partition_trigger
  BEFORE INSERT
  ON test
  FOR each ROW
  EXECUTE PROCEDURE test_partition_function();

-- Try insert rows

insert into test (time) values ('2010-01-01 04:05:06'); -- table test_2010_01
insert into test (time) values ('2010-02-02 04:05:06'); -- table test_2010_02
insert into test (time) values ('2010-03-03 04:05:06'); -- table test_2010_03

`,
    description: "https://wiki.postgresql.org/wiki/Month_based_partitioning"
  },

  "Load CSV from file": {
    sql: "COPY zip_codes FROM '/path/to/csv/ZIP_CODES.txt' DELIMITER ',' CSV HEADER;",
    description: "Table zip_codes should exists importing"
  },

  "Save result as CSV": {
    sql: "COPY table_name TO '/tmp/table_name.csv' DELIMITER ',' CSV HEADER;"
  },

  "Show Autovacuum Settings": {
    sql: `
select name, setting, unit, category, short_desc, extra_desc, source from pg_settings
where category = 'Autovacuum' or name like '%autovacuum%'`
  },

  "Show File Locations": {
    sql: `
select name, setting, unit, category, short_desc, extra_desc, source from pg_settings
where category = 'File Locations' or name like '%file%' or name like '%directory%'`
  },

  "Show Statistics Settings": {
    sql: `
select name, setting, unit, category, short_desc, extra_desc, source from pg_settings
where category like 'Statistics%'`
  },

  "Run Vacuum": {
    sql: `
analyze table_name;
VACUUM (VERBOSE, ANALYZE) table_name;
VACUUM FULL table_name;`,
    description: "http://www.postgresql.org/docs/current/static/routine-vacuuming.html"
  },

  "Create Materialized View": {
    sql: `
CREATE MATERIALIZED VIEW mat_view_name as
select * from table_name
where country = 'United States';`
  },

  "Refresh Materialized View": {
    sql: "REFRESH MATERIALIZED VIEW mat_view_name;"
  },

  "Create Schema": {
    sql: `
CREATE SCHEMA schema_name;
-- CREATE SCHEMA IF NOT EXISTS schema_name AUTHORIZATION joe;
`
  },

  "Listen/Notify": {
    sql: `
LISTEN virtual;
NOTIFY virtual;
NOTIFY virtual, 'This is the payload';
SELECT pg_notify('virt' || 'ual', 'pay' || 'load');
    `
  },

  "Tuple Statistic": {
    sql: `
-- CREATE EXTENSION pgstattuple;
SELECT * FROM pgstattuple('pg_catalog.pg_proc')
    `
  },

  "Create Trigger FOR EACH ROW": {
    sql: `
CREATE TRIGGER check_update
BEFORE UPDATE -- BEFORE/AFTER INSERT/UPDATE/DELETE
  OF balance -- optional
  ON accounts
FOR EACH ROW
WHEN (OLD.balance IS DISTINCT FROM NEW.balance) -- optional
EXECUTE PROCEDURE check_account_update();`
  },

  "Create Trigger FOR EACH STATEMENT": {
    sql: `
CREATE TRIGGER check_update
BEFORE UPDATE ON accounts
FOR EACH STATEMENT
EXECUTE PROCEDURE check_all_accounts_update();
`
  },

  "Foreigner Key Contraint": {
    description: "http://www.tutorialspoint.com/postgresql/postgresql_constraints.htm",
    sql: `
CREATE TABLE table_name (
  id int primary key      not null,
  dept           char(50) not null,
  emp_id         int      references company6(id)
);`
  },

  "List Foreign Servers": {
    sql: `
SELECT
  s.srvname AS "Name",
  pg_catalog.pg_get_userbyid(s.srvowner) AS "Owner",
  f.fdwname AS "Foreign-data wrapper",
  pg_catalog.array_to_string(s.srvacl, E'\n') AS "Access privileges",
  s.srvtype AS "Type",
  s.srvversion AS "Version",
  srvoptions as "FDW Options",
  d.description AS "Description"
FROM pg_catalog.pg_foreign_server s
     JOIN pg_catalog.pg_foreign_data_wrapper f ON f.oid=s.srvfdw
LEFT JOIN pg_description d
       ON d.classoid = s.tableoid AND d.objoid = s.oid AND d.objsubid = 0
ORDER BY 1;
    `
  }
};

Object.forEach(SqlSnippets, function (key, snippet) {
  snippet.sql = snippet.sql.trim();
});
