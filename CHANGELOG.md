### Version 0.8.4 (20-nov-2019)

* Fix `electron.systemPreferences.subscribeNotification` is not a function

### Version 0.8.3 (19-nov-2019)

* Postgres 12 support
* Feature: Basic support for sequences
* Feature: Basic support for MacOS dark mode
* Feature: Add default sorting by id
* Feature: Support connecting to uniq socket
* Feature: Handle disconnects: add icon when disconnected and better dialog (#92)
* Cleanup new_snippet.js (Thanks to [https://github.com/saylestyler][@saylestyler])
* Fixed typos on strings 22 & 39 (Thanks to [https://github.com/kant][@kant])
* Add check for null in CSV export (Thanks to [https://github.com/TheHollidayInn][@TheHollidayInn])
* Add "Send Feedback" button in menu (#75)
* Fix: When renaming connection, don't override existing connection (#79)
* Fix: Make connection selected when auto connected
* Fix saving CSV file
* Build more packages for linux
* Refresh total rows count when reloading content tab (Cmd+R)
* Cut long strings to 500 chars when shown in table
* Make blank as default type when adding column
* Don't show related rows icon when value is null
* Better stack traces for async db errors

### Version 0.8.2 (04-may-2019)

* Feature: Filter tables by name (Thanks to [https://github.com/willvincent](@willvincent))
* Feature: Show related records via foreign key (Thanks to [https://github.com/willvincent](@willvincent))
* Feature: Sava custom snippets (Thanks to [https://github.com/willvincent](@willvincent))
* Fix scrollbar in snippets window (Thanks to [https://github.com/willvincent](@willvincent))
* Feature: reload databases list
* Fix handling short server version eg 11.0
* Fix editing max length for numbers and dates
* Update styles for null fields in query results
* Show more size breakdown in table info
* Add minimum support for Postgres 8
* Add minimum support for CockroachDB
* Add support for postgresql protocol
* Support duplicate column names in query tab
* Fix using special characters in username and password
* Better handling of database errors
* Add quit function for linux
* Don't close edit dialog when press enter in textfield

### Version 0.8.1 (18-jan-2019)

* Support for Linux
* Support for Windows (Thanks to @DavidBernal)
* Change shortcut for open file to Cmd+O
* Adds codemirror search (Thanks to @drozdoff)
* Update to electron 4
* Change from electron-packager to electron-builder
* Automatic builds via travis
* Show index size
* Better error message when can't find psql or pg_dump on linux
* Fix showing interval types
* Reload a tab when table renamed


### Version 0.8.0 (07-jun-2018)

* Feature: Connect with postgres:// URL
* Redesign help screen
* Display same timezone as received from server
* Add original timestamp value in "title" attribute
* Make info page selectable
* homebrew instructions typo fix (Thanks to @tzinmein)
* Fix space closing dialog with custom inputs
* Editing & deleting procedures
* Implement stopRunningQuery for pure-js pg client
* Add typescript hibrid validator
* Show only 100 rows per page for wide tables (more then 30 columns)

### Version 0.7.1 (06-feb-2018)

* Feature: Updating values in table
* Show NULL as “NULL”
* Fix CSV export, save more then 500 rows
* Better text for deletting rows (Thanks to @nickheiner-usds)
* Support Upper case for table names, columns, indexes
* Reduce content pagination to 200
* Add “Create Database” in top menu
* Add refreshing mat. view
* Fix renaming tables
* Skip alert when pg native exception not compiled
* Fix reset zoom & reload
* Update readme and contributing guide
* More async/await

### Version 0.7.0 (22-oct-2017)

* Update to electron 1.7.8
* Update to PostgreSQL 10
* Feature: Auto Connect
* Feature: Show user grants
* Feature: Preserve tab when switch between tables and databases
* Feature: Add red label in list of indexes when index has `indisvalid`
* Feature: Save query result as CSV
* Better message for "server disconnected" error
* Fix connecting to heroku
* Move from ruby sass to node-sass
* Fix editing users
* Change colors on focus leave
* MIgrate big junk of code from callbacks to async/await
* Add integration tests with spectron

### Version 0.6.2 (01-may-2017)

* Fix “Cannot set property 'state' of undefined”
* Use editMenu, zoomin, zoomout for top menu
* Better error handling when table not found anymore
* Update dependencies
* Fix Cannot read property 'rows' of undefined
* Fix this.deleteRow is not a function
* Fix exporter.setNoOwners is not a function
* Dialog for truncate table action, add cascade truncate
* Fix dialog cancel button error

### Version 0.6.1 (11-apr-2017)

* Fix displaying connection error message
* More error reporting
* Fix layout of resizable table when some cell is empty

### Version 0.6.0 (05-apr-2017)

* Add Feature: Truncate table
* Fix checking updates, check updates on startup
* Fix copying in content tab
* Save window state
* Use relative path for view cache instead of absolute
* Order databases alphabetically in a dropdown
* Show loader for query tab, allow cancel running query
* Use use new js tables
* More consistent design (Thanks to @yoonwaiyan)
* Fix deleting index
* Fix exporting file
* Fix history and snippets windows with new electron
* Update to PostgreSQL 9.6
* Add support for postgres:// protocol
* Add `postbird` command line util
* Show real data type in structure table
* Display postigs point in readble format
* Allow cancel adding row
* Show table SQL without OWNED BY
* Show double encoded JSON with pink
* Switch from rollbar to raven for exception notifications
* Modern Mac look
* Convert code to use fat arrow
* Upgrade to electron 1.6
* Upgrade jade to pug
* Update types select
* Close dialog by esc
* Display constraints on table structure page
* Add loader for table modifications
* Set extensions page to same position after install or uninstall
* Smaller release size

### Version 0.5.0 (25-mar-2016)

* Migrate to Electron from Node-Webkit
* Implement adding row to table
* Implement delete row from table
* Better support for editor highlight
* Double click to connect in connection list
* Add shortcuts Cmd+W to close tab
* Add shortcuts Cmd+T to switch to connection
* New design for tabs and home screen
* Fix query window resize bar
* Update dependencies
* Better support for Linux
* Add staticly linked binaries: psql, pg_dump, node-libpq
* Better formatting for EXPLAIN result
* Fix showing column type in title in query result
* Fix displaying json & jsonb fields
* Better xml & html formatting

### Version 0.4.4

* Add support for foreign tables
* Implement simple history window
* Implement reconnect feature, detect when connection lost
* Implement see procedure Source feature
* Show max 500 records in query result
* Add shortcut Cmd+Shift+R to reload app
* Add snippet to kill query
* Add sql snippet to list remote servers
* Improve snippet for CSV LOAD
* Add max-height and scrolling for dialogs (heppen when table have too many columns)
* Remove artificial scrollbar in query editor
* Prevent double click on login form button
* Reload tables list on 'create or replace ...' query
* Update npm packages: rollbar, pg, pg-native, libpq
* Use server version from libpq
* Use manifest.window.toolbar for child windows (snippets, history)
* Disable "create role" button for now
* Highlight current user in users management list
* Double click to connect in connection list
* Fix UI for close tab icon
* Add shortcuts Cmd+W to close tab
* Add shortcuts Cmd+T to switch to connection tab

### Version 0.4.3

* Fix exception when login
* Add position for "Check For Updates..."

### Version 0.4.2

* Add feature to export only data or only structure
* Trim snippets sql, add snippets for mat views
* Edit procedures dialog
* Update CodeMirror and hightlight.js, fix proc edit
* Disable the "bounce" scrolling for OS X
* Implement sort feature in table content tab
* Remove my name from default connection params
* Notify/Listen snippet and support
* Show extension name in procedures list
* Add snippets about triggers and constraints, fix snippets css

### Version 0.4.1

* Add support for "oid" column. Show in columns list, show in content tab
* Build dev version with symlinks
* Build package with nwjs, not node-webkit
* Fix open help multiple times
* More type groups in column dialog
* Fix closing tab error: undefined is not a function
* Add reload feature to content tab
* Add shortcut cmd+R to reload content, structure and info tabs
* Set focus on editor after query complete
* Add support for mat views: structure tab, content tab, drop, sample dataset
* Add index dialog for mat views
* Move app_menu.js to external library
* Support for array types
* Add context menu for text inputs and textareas
* Add type title for content table header
* Attempt to use node-pg-native on mac
* Check server version and detect if server support materialized views
* Fix add column, implement delete column
* Fix add index, implement delete index, add index type
* Set focus in dialogs to first field
* Improve error reporting
* Add grunt build for windows and linux
* Add psql & pg_dump bonaries for each platform
* Feature Snippets window
* Run query by CMD+R in query tab
* Add button to clean result in query tab
* Improve result for non-SELECT statements and status text in query tab
* Feature check for updates

### Version 0.4

* Use new shortcut api
* Add keyboard shortcuts to open help window
* Improve usability for renaming table
* Add feature to import sql files
* In query pane: Run only selected sql (if selected)
* Improve tests environment
* Improve login page design
* Fix set current database selected on load
* Add button to add new connection on login page
* Add feature to save heroku connection
* Auto save last query
* OS X style tables row selections, arrow up/down, switch between tables
* Reload tables when run sql query with create/drop table
* Erase current tab content when drop table
* Fix saving changes in connection on login screen
* List procedures
* List triggers
* Add dialog with installed languages
* Write tests in sync way (with fibers)
* Add own dialect for query runner
* Make different icons for views and materialized views
* Add events to global.App
* Enable/disable database menu, drop database
* Add error reporting with rollbar
* Close connection when closing tab
* Make it run on nwjs 0.12
* Rename database from top menu
* Reload database from top menu
* Create and save database dump
* Display jsonb as json string
* Fix reload app
* Move user related queries to model
* Add owned by user databases in users list
* Show table source sql dialog
* Add info tab (count, size, source sql)
* Make default font helvetica
* Remove any-db dependency


### Version 0.3 (Sep 27, 2014)

* Redesign ui, make in OS X style
* Add login to heroku postgresql server
* General speedup initialization and page rendering
* Update node-webkit to 0.10.5 64bit
* Rework content tab
* Add table selectable and resizable controls

### Version 0.2 (Jul 8, 2014)
