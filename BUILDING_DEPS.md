Download `Postgres.app` and make sure you have command line tools installed


```
cp /Applications/Postgres.app/Contents/Versions/latest/lib/libpq.5.8.dylib ./vendor/darwin/
cp /Applications/Postgres.app/Contents/Versions/latest/lib/libssl.1.0.0.dylib ./vendor/darwin/
cp /Applications/Postgres.app/Contents/Versions/latest/lib/libcrypto.1.0.0.dylib ./vendor/darwin/

install_name_tool -change /Applications/Postgres.app/Contents/Versions/9.5/lib/libssl.1.0.0.dylib @loader_path/libssl.1.0.0.dylib ./vendor/darwin/libpq.5.8.dylib
install_name_tool -change /Applications/Postgres.app/Contents/Versions/9.5/lib/libcrypto.1.0.0.dylib @loader_path/libcrypto.1.0.0.dylib ./vendor/darwin/libpq.5.8.dylib
install_name_tool -change /Applications/Postgres.app/Contents/Versions/9.5/lib/libcrypto.1.0.0.dylib @loader_path/libcrypto.1.0.0.dylib ./vendor/darwin/libssl.1.0.0.dylib

cp /Applications/Postgres.app/Contents/Versions/latest/bin/psql    ./vendor/darwin/
cp /Applications/Postgres.app/Contents/Versions/latest/bin/pg_dump ./vendor/darwin/

install_name_tool -change /Applications/Postgres.app/Contents/Versions/9.5/lib/libpq.5.dylib @loader_path/libpq.5.8.dylib ./vendor/darwin/psql
install_name_tool -change /Applications/Postgres.app/Contents/Versions/9.5/lib/libpq.5.dylib @loader_path/libpq.5.8.dylib ./vendor/darwin/pg_dump


PATH=/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH ./node_modules/.bin/electron-rebuild -n 47

install_name_tool -change /Applications/Postgres.app/Contents/Versions/9.5/lib/libpq.5.dylib @loader_path/../../../../vendor/darwin/libpq.5.8.dylib node_modules/libpq/build/Release/addon.node
```
