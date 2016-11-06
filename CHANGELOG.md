== Version 0.6.0 (pending)

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

== Version 0.5.0

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

== Version 0.4.4

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

== Version 0.4.3

* Fix exception when login
* Add position for "Check For Updates..."

== Version 0.4.2

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

== Version 0.4.1

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

== Version 0.4

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


== Version 0.3 (Sep 27, 2014)

* Redesign ui, make in OS X style
* Add login to heroku postgresql server
* General speedup initialization and page rendering
* Update node-webkit to 0.10.5 64bit
* Rework content tab
* Add table selectable and resizable controls

== Version 0.2 (Jul 8, 2014)
