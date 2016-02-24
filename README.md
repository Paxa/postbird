### Postbird

Postbird is PostgreSQL client for Mac.

![postbird-screenshot](https://cloud.githubusercontent.com/assets/26019/5886586/9fef006c-a3d9-11e4-8330-1651f5243536.png)

![postbird-table-screenshot](https://cloud.githubusercontent.com/assets/26019/6429388/19308eb8-c000-11e4-9848-6d2954f1d65e.png)


#### Download

**Version 0.4.2**

[Postbird-0.4.3.dmg](https://github.com/Paxa/postbird/releases/download/0.4.3/Postbird-0.4.3.dmg) - OS X 10.7+ 64bit


#### Development

Pull requests and suggestions are welcome

To run newest version, simply:

    git clone git@github.com:Paxa/postbird.git
    cd postbird
    ./run

To make a release, run:

    rake build

New release will be at: `~/Postbird.app`

Recomfile libpq:
```sh
cd node_modules/pg-native/node_modules/libpq
PATH=$PATH:/Applications/Postgres.app/Contents/Versions/9.4/bin/ \
HOME=~/.electron-gyp \
node-gyp rebuild --target=0.35.1 --arch=x64 --dist-url=https://atom.io/download/atom-shell
```

**Building static psql and pg_dump (without dependency on libpq):**

Donwload PostgreSQL sources, do:

Configure arguments from: https://github.com/petere/homebrew-postgresql/blob/master/postgresql-9.5.rb

```
./configue
./configure --enable-dtrace --with-bonjour --with-gssapi --with-ldap --with-libxml --with-libxslt --with-openssl --with-uuid=e2fs --with-pam --with-perl --with-python --with-tcl \
--with-libraries=/usr/local/opt/openssl/lib:/usr/local/opt/readline/lib:/usr/local/opt/gettext/lib:/usr/local/opt/tcl-tk/lib:/usr/local/opt/openldap/lib:/usr/local/opt/e2fsprogs/lib \
--with-includes=/usr/local/opt/readline/include:/usr/local/opt/openssl/include:/usr/local/opt/gettext/include:/usr/local/opt/tcl-tk/include:/usr/local/opt/openldap/include:/usr/local/opt/e2fsprogs/include

make
-- wait and search last command with '-o psql'

cd src/bin/psql

-- here is command with additional '../../interfaces/libpq/libpq.a /usr/local/opt/openssl/lib/libssl.a /usr/local/opt/openssl/lib/libcrypto.a' in list of linked libraries (after sql_help.o)

gcc -Wall -Wmissing-prototypes -Wpointer-arith -Wdeclaration-after-statement -Wendif-labels -Wmissing-format-attribute -Wformat-security -fno-strict-aliasing -fwrapv -Wno-unused-command-line-argument -O2 command.o common.o help.o input.o stringutils.o mainloop.o copy.o startup.o prompt.o variables.o large_obj.o print.o describe.o tab-complete.o mbprint.o dumputils.o keywords.o kwlookup.o sql_help.o ../../interfaces/libpq/libpq.a /usr/local/opt/openssl/lib/libssl.a /usr/local/opt/openssl/lib/libcrypto.a  -L../../../src/common -lpgcommon -L../../../src/port -lpgport -L../../../src/interfaces/libpq -lpq -L../../../src/port -L../../../src/common -L/usr/local/opt/openssl/lib -Wl,-dead_strip_dylibs   -lpgcommon -lpgport -lssl -lcrypto -lz -lreadline -lm  -o psql
-- check linked libraries:
otool -L ./psql
```
Do same for `pg_dump`. On mac it should show something like:
```
$ otool -L pg_dump
pg_dump:
    /usr/lib/libz.1.dylib (compatibility version 1.0.0, current version 1.2.5)
    /usr/lib/libSystem.B.dylib (compatibility version 1.0.0, current version 1226.10.1)
```

