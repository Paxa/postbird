# Updating Postgres Binaries from Postgres.app (macOS)

Download `Postgres.app` (e.g. Postgres 18+) and make sure command line tools are installed.

```bash
# 1. Copy Postgres libraries
cp /Applications/Postgres.app/Contents/Versions/latest/lib/libpq.5.dylib ./vendor/darwin/
cp /Applications/Postgres.app/Contents/Versions/latest/lib/libssl.3.dylib ./vendor/darwin/
cp /Applications/Postgres.app/Contents/Versions/latest/lib/libcrypto.3.dylib ./vendor/darwin/
cp /Applications/Postgres.app/Contents/Versions/latest/lib/libzstd.1.*.dylib ./vendor/darwin/libzstd.1.dylib
cp /Applications/Postgres.app/Contents/Versions/latest/lib/liblz4.1.*.dylib ./vendor/darwin/liblz4.1.dylib

# 2. Update dylib IDs
install_name_tool -id @loader_path/libpq.5.dylib vendor/darwin/libpq.5.dylib
install_name_tool -id @loader_path/libssl.3.dylib vendor/darwin/libssl.3.dylib
install_name_tool -id @loader_path/libcrypto.3.dylib vendor/darwin/libcrypto.3.dylib
install_name_tool -id @loader_path/libzstd.1.dylib vendor/darwin/libzstd.1.dylib
install_name_tool -id @loader_path/liblz4.1.dylib vendor/darwin/liblz4.1.dylib

# 3. Copy binaries
cp /Applications/Postgres.app/Contents/Versions/latest/bin/psql    ./vendor/darwin/
cp /Applications/Postgres.app/Contents/Versions/latest/bin/pg_dump ./vendor/darwin/

# 4. Link binaries to loader_path dylibs
install_name_tool -change @loader_path/../lib/libpq.5.dylib @loader_path/libpq.5.dylib vendor/darwin/psql

install_name_tool -change @loader_path/../lib/libpq.5.dylib @loader_path/libpq.5.dylib vendor/darwin/pg_dump
install_name_tool -change @loader_path/../lib/libzstd.1.dylib @loader_path/libzstd.1.dylib vendor/darwin/pg_dump
install_name_tool -change @loader_path/../lib/liblz4.1.dylib @loader_path/liblz4.1.dylib vendor/darwin/pg_dump
install_name_tool -change @loader_path/../lib/libcrypto.3.dylib @loader_path/libcrypto.3.dylib vendor/darwin/pg_dump

# 5. Ad-hoc codesign and remove quarantine attribute
xattr -d com.apple.quarantine vendor/darwin/* 2>/dev/null || true
codesign --force --deep -s - vendor/darwin/*

# 6. Verify binaries
./vendor/darwin/psql --version
./vendor/darwin/pg_dump --version
```
