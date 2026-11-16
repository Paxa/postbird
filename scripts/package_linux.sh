#!/bin/bash
set -euo pipefail

TARGET="${1:-linux-x64}"
VERSION=$(bun -e "console.log(require('./package.json').version)")
ARCH="x86_64"
DEB_ARCH="amd64"
RPM_ARCH="x86_64"

if [[ "$TARGET" == *"arm64"* ]]; then
  ARCH="aarch64"
  DEB_ARCH="arm64"
  RPM_ARCH="aarch64"
fi

echo "==> Packaging Linux artifacts for $TARGET ($ARCH, version $VERSION)..."

BUILD_DIR=""
if [ -d "build/stable-linux-x64/Postbird" ]; then
  BUILD_DIR="build/stable-linux-x64/Postbird"
elif [ -d "build/stable-linux-arm64/Postbird" ]; then
  BUILD_DIR="build/stable-linux-arm64/Postbird"
elif [ -d "build/dev-linux-x64/Postbird-dev" ]; then
  BUILD_DIR="build/dev-linux-x64/Postbird-dev"
elif [ -d "build/dev-linux-arm64/Postbird-dev" ]; then
  BUILD_DIR="build/dev-linux-arm64/Postbird-dev"
fi

if [ -z "$BUILD_DIR" ]; then
  echo "Error: Could not find Electrobun Linux build directory in build/"
  exit 1
fi

# A stable Electrobun build is a self-extractor: bin/launcher plus
# Resources/<hash>.tar.zst. Run as is, it unpacks a second copy of the app
# into ~/.local/share and drops a shortcut on the Desktop. The packages ship
# the unpacked app instead, whose own bin/launcher starts bun directly.
WORK_DIR=$(mktemp -d)
trap 'rm -rf "$WORK_DIR"' EXIT

shopt -s nullglob
TARBALLS=("$BUILD_DIR"/Resources/*.tar.zst)
shopt -u nullglob

if [ "${#TARBALLS[@]}" -eq 1 ]; then
  echo "==> Unpacking ${TARBALLS[0]}..."
  mkdir -p "$WORK_DIR/unpacked"
  tar --zstd -xf "${TARBALLS[0]}" -C "$WORK_DIR/unpacked"
  shopt -s nullglob
  TOP_DIRS=("$WORK_DIR"/unpacked/*/)
  shopt -u nullglob
  if [ "${#TOP_DIRS[@]}" -ne 1 ]; then
    echo "Error: expected one top-level directory in ${TARBALLS[0]}, found ${#TOP_DIRS[@]}"
    exit 1
  fi
  APP_SRC="${TOP_DIRS[0]%/}"
elif [ "${#TARBALLS[@]}" -eq 0 ]; then
  # Dev builds are not wrapped in a self-extractor.
  APP_SRC="$BUILD_DIR"
else
  echo "Error: expected at most one .tar.zst in $BUILD_DIR/Resources, found ${#TARBALLS[@]}"
  exit 1
fi

for f in bin/launcher bin/bun Resources/main.js; do
  if [ ! -f "$APP_SRC/$f" ]; then
    echo "Error: $APP_SRC/$f is missing, so the packaged app could not start"
    exit 1
  fi
done
chmod +x "$APP_SRC/bin/launcher" "$APP_SRC/bin/bun"
# The self-extractor writes its own .desktop at install time; ours replaces it.
rm -f "$APP_SRC/Postbird.desktop"

mkdir -p artifacts

# 1. Build .deb and .rpm via fpm (if installed)
if command -v fpm >/dev/null 2>&1; then
  echo "==> Building .deb and .rpm using fpm..."
  STAGE_DIR="$WORK_DIR/stage"
  mkdir -p "$STAGE_DIR/opt/postbird"
  mkdir -p "$STAGE_DIR/usr/bin"
  mkdir -p "$STAGE_DIR/usr/share/applications"
  mkdir -p "$STAGE_DIR/usr/share/icons/hicolor/512x512/apps"

  cp -a "$APP_SRC"/. "$STAGE_DIR/opt/postbird/"
  ln -sf /opt/postbird/bin/launcher "$STAGE_DIR/usr/bin/postbird"
  cp build_files/postbird.desktop "$STAGE_DIR/usr/share/applications/"
  cp build_files/icon.png "$STAGE_DIR/usr/share/icons/hicolor/512x512/apps/postbird.png"
  # The package's "./" entry takes the stage dir's mode. Left at mktemp's
  # 0700, it can lock down / on install.
  chmod -R u+rwX,go+rX,go-w "$STAGE_DIR"

  # Build .deb
  fpm -s dir -t deb \
    -n postbird \
    -v "$VERSION" \
    -a "$DEB_ARCH" \
    --description "Postbird is a cross-platform PostgreSQL GUI client, written in TypeScript, powered by Electrobun" \
    --url "https://github.com/Paxa/postbird" \
    --license "MIT" \
    --category "Database" \
    --depends "libwebkit2gtk-4.1-0 | libwebkit2gtk-4.0-37" \
    -p "artifacts/Postbird-${TARGET}.deb" \
    -C "$STAGE_DIR" .

  # Build .rpm
  fpm -s dir -t rpm \
    -n postbird \
    -v "$VERSION" \
    -a "$RPM_ARCH" \
    --description "Postbird is a cross-platform PostgreSQL GUI client, written in TypeScript, powered by Electrobun" \
    --url "https://github.com/Paxa/postbird" \
    --license "MIT" \
    --category "Database" \
    -p "artifacts/Postbird-${TARGET}.rpm" \
    -C "$STAGE_DIR" .
fi

# 2. Build .AppImage (if appimagetool is available)
APPIMAGETOOL=""
if command -v appimagetool >/dev/null 2>&1; then
  APPIMAGETOOL="appimagetool"
elif [ -f "/tmp/appimagetool" ]; then
  APPIMAGETOOL="/tmp/appimagetool"
fi

if [ -n "$APPIMAGETOOL" ]; then
  echo "==> Building .AppImage using $APPIMAGETOOL..."
  APP_DIR="$WORK_DIR/AppDir"
  mkdir -p "$APP_DIR/usr/lib/postbird"
  mkdir -p "$APP_DIR/usr/share/applications"
  mkdir -p "$APP_DIR/usr/share/icons/hicolor/512x512/apps"

  cp -a "$APP_SRC"/. "$APP_DIR/usr/lib/postbird/"
  cp build_files/postbird.desktop "$APP_DIR/"
  cp build_files/postbird.desktop "$APP_DIR/usr/share/applications/"
  cp build_files/icon.png "$APP_DIR/postbird.png"
  cp build_files/icon.png "$APP_DIR/usr/share/icons/hicolor/512x512/apps/postbird.png"

  cat << 'EOF' > "$APP_DIR/AppRun"
#!/bin/sh
HERE="$(dirname "$(readlink -f "${0}")")"
exec "${HERE}/usr/lib/postbird/bin/launcher" "$@"
EOF
  chmod +x "$APP_DIR/AppRun"
  # appimagetool refuses an AppDir below mode 0755.
  chmod -R u+rwX,go+rX,go-w "$APP_DIR"

  OUT="artifacts/Postbird-${TARGET}.AppImage"
  if ! ARCH="$ARCH" "$APPIMAGETOOL" --appimage-extract-and-run "$APP_DIR" "$OUT"; then
    ARCH="$ARCH" "$APPIMAGETOOL" "$APP_DIR" "$OUT"
  fi
fi

echo "==> Linux packaging complete for $TARGET:"
ls -lh artifacts/
