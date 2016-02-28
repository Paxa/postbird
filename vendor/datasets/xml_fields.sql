drop table if exists xml_books;
CREATE TABLE xml_books ( id integer, data xml );

INSERT INTO xml_books VALUES (1,
  '<?xml version="1.0" encoding="UTF-8" ?>
  <data>
	<name>Book the First</name>
	<author>
		<first_name>Bob</first_name>
		<last_name>White</last_name>
	</author>
  </data>
');
INSERT INTO xml_books VALUES (2,
  '<?xml version="1.0" encoding="UTF-8" ?>
  <data>
	<name>Book the Second</name>
	<author>
		<first_name>Charles</first_name>
		<last_name>Xavier</last_name>
	</author>
  </data>
');
INSERT INTO xml_books VALUES (3,
  '<?xml version="1.0" encoding="UTF-8" ?>
  <data>
	<name>Book the Third</name>
	<author>
		<first_name>Jim</first_name>
		<last_name>Brown</last_name>
	</author>
  </data>
');
