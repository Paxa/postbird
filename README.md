### Postbird

Postbird is postgresql client for Mac.
![postbird-0 3-screenshot](https://cloud.githubusercontent.com/assets/26019/5886586/9fef006c-a3d9-11e4-8330-1651f5243536.png)

![postbird-0 3-screenshot](https://cloud.githubusercontent.com/assets/26019/6429388/19308eb8-c000-11e4-9848-6d2954f1d65e.png)


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
* Add index window is disappearing
* Allow reside columns only in header
* Work on content tab: filters, sticky header, pagination, increase limit, sortings
* Materialized views structure
* Drop view/materialized view
* Fix Table.describe when there is same tables in different schemas
* Code snippets in query tab
* Export only structure
* Drop schema
