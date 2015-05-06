DROP TABLE IF EXISTS different_types;

CREATE EXTENSION IF NOT EXISTS hstore;

DROP TYPE IF EXISTS human_gender;
CREATE TYPE human_gender AS ENUM ('male', 'female');

CREATE TABLE different_types (
  id serial primary key,
  col_array_int integer[],
  col_matrix_3x3 integer[3][3],
  col_array_text text[],
  col_hstore hstore,
  col_gender human_gender
);

-- insert all nulls
insert into different_types (id) values (nextval('different_types_id_seq'::regclass));

insert into different_types (col_array_int, col_matrix_3x3, col_array_text, col_hstore, col_gender) values
  (
    '{1, 2, 3, 4, 5}',
    '{ {1, 2, 3}, {11, 12, 13}, {21, 22, 23} }',
    '{"apple", "orange", "banana", "mangga"}',
    'author => "Katherine Dunn", pages => 368, category => fiction',
    'male'
  );