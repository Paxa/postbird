CREATE EXTENSION IF NOT EXISTS postgres_fdw;

CREATE TABLE catalogs (
    id serial,
    name character varying NOT NULL,
    schema text NOT NULL,
    updated_at timestamp NOT NULL
);

GRANT SELECT ON catalogs TO sync;
GRANT SELECT ON catalogs_id_seq TO sync;

insert into catalogs (name, schema, updated_at) values ('world_airports', '(
    airport_id integer NOT NULL,
    name character varying,
    city character varying,
    country character varying,
    iata_faa character varying,
    iaco character varying,
    latitude double precision,
    longitude double precision,
    altitude integer,
    zone real,
    dst character(1)
)', now());

-- -- on client


-- FUNC datadb__create_alike_table("NAME")
CREATE OR REPLACE FUNCTION public.datadb__create_alike_table(remote_name text, local_name text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
declare create_table_sql text;
begin
    select state.create_table_sql::text into create_table_sql from dblink(
      'dbname=datadb port=6432 host=mysql-d.tk user=sync password=sync',
      E'select schema from catalogs where name = \'' || remote_name || E'\''
    ) as state(create_table_sql text);

    execute 'create table ' || local_name || ' ' || create_table_sql;
    return 1;
end;
$function$;


-- FUNC datadb__list_remote_tables()
CREATE OR REPLACE FUNCTION public.datadb__list_remote_tables()
 RETURNS TABLE (name text)
 LANGUAGE plpgsql
AS $function$
declare
  names text;
begin
    RETURN QUERY select *  from dblink(
      'dbname=datadb port=6432 host=mysql-d.tk user=sync password=sync',
      E'select name from catalogs'
    ) as catalogs(name text);
end;
$function$;


-- FUNC datadb__create_remote_table('world_airports', 'r2_world_airports')
CREATE OR REPLACE FUNCTION public.datadb__create_remote_table(remote_name text, local_name text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
declare
  create_table_sql text;
begin
    select state.create_table_sql::text into create_table_sql from dblink(
      'dbname=datadb port=6432 host=mysql-d.tk user=sync password=sync',
      E'select schema from catalogs where name = \'' || remote_name || E'\''
    ) as state(create_table_sql text);

    execute 'CREATE FOREIGN TABLE ' || local_name || ' ' || create_table_sql ||
    E' SERVER sync_db
      OPTIONS (schema_name \'public\', table_name \'' || remote_name || E'\');';
    return 1;
end;
$function$;


-- FUNC datadb__sync_from_remote_table('world_airports', 'world_airports')
CREATE OR REPLACE FUNCTION public.datadb__sync_from_remote_table(remote_name text, local_name text)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
declare
  tmp_table text;
begin
  tmp_table := 'datadb__' || local_name;
  PERFORM datadb__create_remote_table(remote_name, tmp_table);
  execute 'truncate ' || local_name || ';';
  execute 'insert into ' || local_name || ' select * from ' || tmp_table || ';';
  execute 'DROP FOREIGN TABLE ' || tmp_table || ';';
  return 1;
end;
$function$;

select datadb__list_remote_tables();
select datadb__create_alike_table('world_airports', 'world_airports_local');
select datadb__sync_from_remote_table('world_airports', 'world_airports_local');

CREATE TABLE catalogs (
    id serial,
    name character varying NOT NULL,
    schema text NOT NULL,
    updated_at timestamp NOT NULL
);

CREATE TABLE hubway_stations (
  id serial,
  terminal character varying,
  station character varying,
  municipal character varying,
  lat double precision,
  lng double precision,
  status character varying
);

create table hubway_trips (
  id 	serial,
  hubway_id 	bigint,
  status 	character varying(10),
  duration 	integer,
  start_date 	timestamp without time zone,
  strt_statn 	integer,
  end_date 	timestamp without time zone,
  end_statn 	integer,
  bike_nr 	character varying(20),
  subsc_type 	character varying(20),
  zip_code 	character varying(6),
  birth_date 	integer,
  gender 	character varying(10)
);