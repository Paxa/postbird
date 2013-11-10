var url = require('url');
module.exports = function (dbUrl) {
  if (typeof dbUrl === 'object') {
    if (dbUrl.adapter != null) return dbUrl
    else throw new Error("'adapter' is required in config objects")
  }
	var parsed = url.parse(dbUrl, true)
	if (parsed.auth) {
		var auth = parsed.auth.split(':')
		parsed.user = auth[0];
		parsed.password = auth[1];
	}
  var adapter = parsed.protocol.replace(':', '')
  var database = parsed.pathname;

  // Trim leading slash for non-sqlite3 databases
  if (adapter !== 'sqlite3' && database) {
    var database = database.substring(1)
  }

	var config = {
		adapter:  adapter,
		host:     parsed.hostname,
		port:     parsed.port,
		database: database,
		user:     parsed.user,
		password: parsed.password
	}

  for (var k in parsed.query) config[k] = parsed.query[k]

  return config;
}
