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
./configure --enable-dtrace --with-bonjour --with-gssapi --with-ldap --with-libxml --with-libxslt --with-openssl --with-uuid=e2fs --with-pam --with-perl --with-python --with-tcl \
--with-libraries=/usr/local/opt/openssl/lib:/usr/local/opt/readline/lib:/usr/local/opt/gettext/lib:/usr/local/opt/tcl-tk/lib:/usr/local/opt/openldap/lib:/usr/local/opt/e2fsprogs/lib \
--with-includes=/usr/local/opt/readline/include:/usr/local/opt/openssl/include:/usr/local/opt/gettext/include:/usr/local/opt/tcl-tk/include:/usr/local/opt/openldap/include:/usr/local/opt/e2fsprogs/include

MACOSX_DEPLOYMENT_TARGET=10.5 make
```

wait till finish and search last command with '-o psql'

```
cd src/bin/psql
```

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

Build libpq extension:

Add `ENV["MACOSX_DEPLOYMENT_TARGET"] = "10.5"` in postgresql and openssl homebrew formulas.

```
brew install --build-from-source postgresql
brew install --build-from-source openssl

cd node_modules/libpq
node-gyp --verbose rebuild
```

Find command with `-o Release/addon.node` and add `/usr/local/Cellar/postgresql/9.5.1/lib/libpq.a /usr/local/opt/openssl/lib/libssl.a /usr/local/opt/openssl/lib/libcrypto.a` in list of 



