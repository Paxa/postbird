== Version 0.4.1 dev

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
