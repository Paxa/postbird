-- from http://clarkdave.net/2013/06/what-can-you-do-with-postgresql-and-json/

drop table if exists json_books;
CREATE TABLE json_books ( id integer, data json );

INSERT INTO json_books VALUES (1,
  '{ "name": "Book the First", "author": { "first_name": "Bob", "last_name": "White" } }');
INSERT INTO json_books VALUES (2,
  '{ "name": "Book the Second", "author": { "first_name": "Charles", "last_name": "Xavier" } }');
INSERT INTO json_books VALUES (3,
  '{ "name": "Book the Third", "author": { "first_name": "Jim", "last_name": "Brown" } }');

CREATE UNIQUE INDEX json_books_author_first_name ON json_books ((data->'author'->>'first_name'));


drop table if exists jsonb_books;
CREATE TABLE jsonb_books ( id integer, data jsonb );

INSERT INTO jsonb_books VALUES (1,
  '{ "name": "Book the First", "author": { "first_name": "Bob", "last_name": "White" } }');
INSERT INTO jsonb_books VALUES (2,
  '{ "name": "Book the Second", "author": { "first_name": "Charles", "last_name": "Xavier" } }');
INSERT INTO jsonb_books VALUES (3,
  '{ "name": "Book the Third", "author": { "first_name": "Jim", "last_name": "Brown" } }');

CREATE UNIQUE INDEX jsonb_books_author_first_name ON jsonb_books ((data->'author'->>'first_name'));
