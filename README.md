### Postbird

Postbird is postgresql client for Mac.
![postbird-0 3-screenshot](https://cloud.githubusercontent.com/assets/26019/4430203/3664fa62-4622-11e4-861a-0627ef37ecdb.png)


#### Download

**Version 0.3**

[Postgres.nw](https://github.com/Paxa/postbird/releases/download/0.3/Postbird.nw) - requires node-webkit.app

[Postgres-0.3.dmg](https://github.com/Paxa/postbird/releases/download/0.3/Postbird-0.3.dmg) - For Mac: 64bit, 10.7+


#### Development

Pull requests and suggestions are welcome

To run newest version, simply:

    git clone git@github.com:Paxa/postbird.git
    cd postbird
    ./run

To make a release, run:

    rake build

New release will be at: `~/Postbird.app`

My todo:

* Content tab reload
* Reload tables if running query with "Drop table" or "Create table"
* Add index window is disappearing
* Allow reside columns only in header
* Work on content tab: filters, sticky header, pagination, increase limit, sortings
* Remove database
* Auto save last query in localstorage
* When chose saved connection, change and click "Save & Connect" then need to update existing (don't create new)
