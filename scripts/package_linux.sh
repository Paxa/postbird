#!/bin/bash
set -e

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

mkdir -p artifacts

# 1. Build .deb and .rpm via fpm (if installed)
if command -v fpm >/dev/null 2>&1; then
  echo "==> Building .deb and .rpm using fpm..."
  STAGE_DIR=$(mktemp -d)
  mkdir -p "$STAGE_DIR/opt/postbird"
  mkdir -p "$STAGE_DIR/usr/bin"
  mkdir -p "$STAGE_DIR/usr/share/applications"
  mkdir -p "$STAGE_DIR/usr/share/icons/hicolor/512x512/apps"

  cp -r "$BUILD_DIR"/* "$STAGE_DIR/opt/postbird/"
  chmod +x "$STAGE_DIR/opt/postbird/Postbird" 2>/dev/null || true
  ln -sf /opt/postbird/Postbird "$STAGE_DIR/usr/bin/postbird"
  cp build_files/postbird.desktop "$STAGE_DIR/usr/share/applications/"
  cp build_files/icon.png "$STAGE_DIR/usr/share/icons/hicolor/512x512/apps/postbird.png"

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

  rm -rf "$STAGE_DIR"
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
  APP_DIR=$(mktemp -d)
  mkdir -p "$APP_DIR/usr/bin"
  mkdir -p "$APP_DIR/usr/share/applications"
  mkdir -p "$APP_DIR/usr/share/icons/hicolor/512x512/apps"

  cp -r "$BUILD_DIR"/* "$APP_DIR/usr/bin/"
  cp build_files/postbird.desktop "$APP_DIR/"
  cp build_files/postbird.desktop "$APP_DIR/usr/share/applications/"
  cp build_files/icon.png "$APP_DIR/postbird.png"
  cp build_files/icon.png "$APP_DIR/usr/share/icons/hicolor/512x512/apps/postbird.png"

  cat << 'EOF' > "$APP_DIR/AppRun"
#!/bin/sh
HERE="$(dirname "$(readlink -f "${0}")")"
exec "${HERE}/usr/bin/Postbird" "$@"
EOF
  chmod +x "$APP_DIR/AppRun"

  ARCH="$ARCH" "$APPIMAGETOOL" --appimage-extract-and-run "$APP_DIR" "artifacts/Postbird-${TARGET}.AppImage" || \
  ARCH="$ARCH" "$APPIMAGETOOL" "$APP_DIR" "artifacts/Postbird-${TARGET}.AppImage" || true

  rm -rf "$APP_DIR"
fi

echo "==> Linux packaging complete for $TARGET:"
ls -lh artifacts/
