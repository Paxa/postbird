### Postbird

Postbird is PostgreSQL client for Mac.

![postbird-screenshot](https://cloud.githubusercontent.com/assets/26019/5886586/9fef006c-a3d9-11e4-8330-1651f5243536.png)

![postbird-table-screenshot](https://cloud.githubusercontent.com/assets/26019/6429388/19308eb8-c000-11e4-9848-6d2954f1d65e.png)


#### Download

**Version 0.4.1**

[Postgres-0.4.1.dmg](https://github.com/Paxa/postbird/releases/download/0.4.1/Postbird-0.4.1.dmg) - For Mac: 64bit, 10.7+


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

* Allow reside columns only in header
* Work on content tab: filters, sticky header, pagination, increase limit, sortings
* Fix Table.describe when there is same tables in different schemas
* Export only structure
* Drop schema
* Table/mat-view actions: vacuum, analyze, refresh view
* Auto-login feature
