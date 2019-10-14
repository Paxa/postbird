Download `Postgres.app` and make sure you have command line tools installed


```
# Copy postgres libs

cp /Applications/Postgres.app/Contents/Versions/latest/lib/libpq.5.12.dylib ./vendor/darwin/
cp /Applications/Postgres.app/Contents/Versions/latest/lib/libssl.1.1.dylib ./vendor/darwin/
cp /Applications/Postgres.app/Contents/Versions/latest/lib/libcrypto.1.1.dylib ./vendor/darwin/

install_name_tool -change /Applications/Postgres.app/Contents/Versions/12/lib/libssl.1.1.dylib @loader_path/libssl.1.1.dylib ./vendor/darwin/libpq.5.12.dylib
install_name_tool -change /Applications/Postgres.app/Contents/Versions/12/lib/libcrypto.1.1.dylib @loader_path/libcrypto.1.1.dylib ./vendor/darwin/libpq.5.12.dylib
install_name_tool -change /Applications/Postgres.app/Contents/Versions/12/lib/libcrypto.1.1.dylib @loader_path/libcrypto.1.1.dylib ./vendor/darwin/libssl.1.1.dylib

## check with otool

otool -L vendor/darwin/libpq.5.12.dylib
otool -L vendor/darwin/libssl.1.1.dylib
otool -L vendor/darwin/libcrypto.1.1.dylib

# Copy postgres psql & pg_dump
cp /Applications/Postgres.app/Contents/Versions/latest/bin/psql    ./vendor/darwin/
cp /Applications/Postgres.app/Contents/Versions/latest/bin/pg_dump ./vendor/darwin/

install_name_tool -change /Applications/Postgres.app/Contents/Versions/12/lib/libpq.5.dylib @loader_path/libpq.5.12.dylib ./vendor/darwin/psql
install_name_tool -change /Applications/Postgres.app/Contents/Versions/12/lib/libpq.5.dylib @loader_path/libpq.5.12.dylib ./vendor/darwin/pg_dump

## check with otool

otool -L vendor/darwin/psql
otool -L vendor/darwin/pg_dump

# Build libpq package

PATH=/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH ./node_modules/.bin/electron-rebuild -n 59

install_name_tool -change /Applications/Postgres.app/Contents/Versions/12/lib/libpq.5.dylib @loader_path/../../../../vendor/darwin/libpq.5.12.dylib node_modules/libpq/build/Release/addon.node

## check addon.node with otool (should have @loader_path/../...)

otool -L node_modules/libpq/build/Release/addon.node

```
