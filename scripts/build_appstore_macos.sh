#!/usr/bin/env bash
# build_appstore_macos.sh
#
# Mac App Store / TestFlight pipeline for Postbird (Splitfire AB, arm64).
#
# Electrobun only knows Developer ID signing, so we build unsigned with
# `bun run dist`, then re-sign the app ourselves and package it with productbuild.
#
# The stable-channel .app that Electrobun emits is a thin self-extracting
# launcher: Contents/Resources/<hash>.tar.zst holds the real app and the
# launcher unpacks it into ~/Library/Application Support on first run. The App
# Store forbids that (all code must ship inside the signed bundle), so `prepare`
# unpacks the archive at build time and ships the inner app instead.
#
# Stages (each can run alone; `all` runs build..upload):
#   build        bun run dist, unsigned
#   prepare      inner app -> build/appstore/Postbird.app, patch plists, embed profile
#   icu          replace bun's libicucore imports with a bundled, renamed ICU
#   sign         codesign inside-out with Apple Distribution
#   pkg          productbuild, signed with the 3rd Party Mac Developer Installer cert
#   validate     asc apps validate
#   upload       asc apps upload
#   sandbox-test local smoke test: prepare + sign with Apple Development, no profile
#
# Usage: bun run appstore:mac [stage]

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${REPO_ROOT}/build/appstore"
APP_PATH="${OUT_DIR}/Postbird.app"
PKG_PATH="${OUT_DIR}/Postbird.pkg"
ENT_DIR="${REPO_ROOT}/build_files/appstore"
BUILD_NUMBER_FILE="${OUT_DIR}/build-number.txt"

BUNDLE_ID="${BUNDLE_ID:-com.postbird.PostbirdApp}"
TEAM_ID="2TQF86ZACD"
APP_ID="${ASC_APP_ID:-6835274467}"
PROFILE_NAME="${PROFILE_NAME:-Postbird Mac AppStore Distribution 2026}"
PROFILE_DIR="${HOME}/Repositories/apple-certificates/postbird"
PROFILE_PATH="${PROFILE_PATH:-${PROFILE_DIR}/Postbird_macOS_AppStore_Distribution_Profile.provisionprofile}"
APP_IDENTITY_LABEL="Apple Distribution: Splitfire AB"
INSTALLER_IDENTITY_LABEL="3rd Party Mac Developer Installer: Splitfire AB"
MIN_MACOS="${MIN_MACOS:-12.0}"

export ASC_API_KEY="${ASC_API_KEY:-L84N624YQH}"
export ASC_ISSUER_ID="${ASC_ISSUER_ID:-b4e8d369-8b7d-4538-8435-643b73237575}"

step() { echo ""; echo "── $* ──────────────────────────────────────────────"; }
ok()   { echo "✅  $*"; }
fail() { printf "❌  %b\n" "$*" >&2; exit 1; }

# ── Toolchain: altool and productbuild must come from a release Xcode ─────────
pick_release_xcode() {
  local pin="${XCODE_PIN:-26.6}" app
  for app in /Applications/Xcode-"$pin"*.app /Applications/Xcode_"$pin"*.app; do
    [[ -d "$app/Contents/Developer" ]] && { printf '%s\n' "$app/Contents/Developer"; return; }
  done
  local active; active="$(xcode-select -p 2>/dev/null || true)"
  if [[ -n "$active" && "$active" != *[Bb]eta* ]]; then printf '%s\n' "$active"; return; fi
  for app in /Applications/Xcode*.app; do
    case "$app" in *[Bb]eta*) continue ;; esac
    [[ -d "$app/Contents/Developer" ]] && { printf '%s\n' "$app/Contents/Developer"; return; }
  done
}
DEVELOPER_DIR="${DEVELOPER_DIR:-$(pick_release_xcode)}"
export DEVELOPER_DIR
# A SDKROOT inherited from another Xcode would mix SDKs with the pinned toolchain.
unset SDKROOT
[[ -n "$DEVELOPER_DIR" && "$DEVELOPER_DIR" != *[Bb]eta* ]] \
  || fail "No release Xcode found. Set DEVELOPER_DIR to a release Xcode's Contents/Developer."

# SHA-1 of the first keychain identity whose label contains $1.
find_identity() {
  security find-identity -v -p basic 2>/dev/null \
    | awk -v want="$1" 'index($0, want) {print $2; exit}'
}

# SHA-1 of the first "Apple Development" identity that belongs to our team. The
# keychain also holds personal-team dev certs, and a sandboxed app signed with one
# is killed at launch because its team ID differs from the Splitfire AB container.
find_team_dev_identity() {
  local tmp valid f h; tmp="$(mktemp -d -t devcerts-XXXXXX)"
  valid="$(security find-identity -v -p codesigning 2>/dev/null | awk '/Apple Development/{print $2}')"
  security find-certificate -a -c "Apple Development" -Z -p 2>/dev/null | awk -v dir="$tmp" '
    /SHA-1 hash:/ {f = dir "/" $3 ".pem"; next}
    f != "" {print > f}'
  for f in "$tmp"/*.pem; do
    [[ -f "$f" ]] || continue
    h="$(basename "$f" .pem)"
    if grep -qx "$h" <<<"$valid" && openssl x509 -in "$f" -noout -subject | grep -q "OU=${TEAM_ID}"; then
      echo "$h"; break
    fi
  done
  rm -rf "$tmp"
}

# ── Plist / profile helpers ───────────────────────────────────────────────────
config_version() {
  jq -r .version "${REPO_ROOT}/package.json"
}

plist_set() { # plist key type value
  /usr/libexec/PlistBuddy -c "Set :$2 $4" "$1" 2>/dev/null \
    || /usr/libexec/PlistBuddy -c "Add :$2 $3 $4" "$1"
}

# Leaf cert SHA-1 of a signed .app (uppercase, no colons). codesign writes
# codesign0..N into the cwd, so run in a scratch dir.
codesign_leaf_sha1() {
  local app="$1" tmp; tmp="$(mktemp -d -t codesign-leaf-XXXXXX)"
  (
    cd "$tmp"
    codesign -d --extract-certificates "$app" >/dev/null 2>&1
    [[ -s codesign0 ]] || exit 1
    openssl x509 -inform DER -in codesign0 -fingerprint -sha1 -noout \
      | awk -F'=' '/SHA1 Fingerprint/{gsub(":","",$2); print toupper($2)}'
  )
  local rc=$?
  rm -rf "$tmp"
  return $rc
}

# SHA-1 of DeveloperCertificates[0] in a provisioning profile.
profile_leaf_sha1() {
  local prof="$1" tmp; tmp="$(mktemp -d -t profile-XXXXXX)"
  security cms -D -i "$prof" > "$tmp/p.plist" 2>/dev/null || { rm -rf "$tmp"; return 1; }
  plutil -extract DeveloperCertificates.0 raw -o - "$tmp/p.plist" | base64 -d > "$tmp/c.der" 2>/dev/null \
    || { rm -rf "$tmp"; return 1; }
  openssl x509 -inform DER -in "$tmp/c.der" -fingerprint -sha1 -noout \
    | awk -F'=' '/SHA1 Fingerprint/{gsub(":","",$2); print toupper($2)}'
  rm -rf "$tmp"
}

verify_codesign_matches_profile() {
  local prof="${APP_PATH}/Contents/embedded.provisionprofile" a p
  [[ -f "$prof" ]] || fail "No embedded.provisionprofile in ${APP_PATH}. Run 'prepare' first."
  a="$(codesign_leaf_sha1 "$APP_PATH")" || fail "Could not read the codesign cert from ${APP_PATH}."
  p="$(profile_leaf_sha1 "$prof")"      || fail "Could not read DeveloperCertificates[0] from ${prof}."
  echo "🔏  codesign leaf → ${a}"
  echo "📜  profile leaf  → ${p}"
  [[ "$a" == "$p" ]] || fail "Signing cert does not match the provisioning profile (upload error 90284).\n       Download a profile that includes the cert you signed with, and re-run."
  ok "Signing cert matches the provisioning profile"
}

# ── Stages ────────────────────────────────────────────────────────────────────
find_built_app() {
  local d
  for d in "${REPO_ROOT}"/build/stable-macos-arm64/*.app; do
    [[ -d "$d" ]] && { printf '%s\n' "$d"; return; }
  done
}

do_build() {
  step "1  Build (unsigned)"
  # No signing: Electrobun only signs when these are present.
  unset ELECTROBUN_DEVELOPER_ID ELECTROBUN_APPLEAPIKEY ELECTROBUN_APPLEAPIKEYID \
        ELECTROBUN_APPLEAPIISSUER ELECTROBUN_TEAMID
  (cd "$REPO_ROOT" && bun run dist)
  [[ -n "$(find_built_app)" ]] || fail "Build finished but no .app under build/stable-macos-arm64/"
  ok "Built $(find_built_app)"
}

ensure_profile() {
  [[ -f "$PROFILE_PATH" ]] && return
  step "Downloading provisioning profile"
  local id
  id="$(asc profiles list --name "$PROFILE_NAME" \
        | jq -r '[.[] | select(.profile_state=="ACTIVE")][0].id // empty')"
  [[ -n "$id" ]] || fail "No ACTIVE profile named '${PROFILE_NAME}'."
  mkdir -p "$(dirname "$PROFILE_PATH")"
  asc profiles download "$id" --output "$PROFILE_PATH"
  ok "Profile ${id} → ${PROFILE_PATH}"
}

# do_prepare <appstore|dev>
do_prepare() {
  local mode="${1:-appstore}"
  step "2  Prepare (${mode})"

  local built; built="$(find_built_app)"
  [[ -n "$built" ]] || fail "No built app. Run 'build' first."

  local archive; archive="$(ls "$built"/Contents/Resources/*.tar.zst 2>/dev/null | head -1 || true)"
  mkdir -p "$OUT_DIR"
  rm -rf "$APP_PATH" "${OUT_DIR}/extract"
  if [[ -n "$archive" ]]; then
    # Self-extracting stable bundle: ship the inner app, not the launcher shell.
    mkdir -p "${OUT_DIR}/extract"
    zstd -dc "$archive" | tar -x -C "${OUT_DIR}/extract"
    local inner; inner="$(ls -d "${OUT_DIR}"/extract/*.app | head -1)"
    [[ -d "$inner" ]] || fail "Archive ${archive} contained no .app"
    mv "$inner" "$APP_PATH"
    rm -rf "${OUT_DIR}/extract"
  else
    ditto "$built" "$APP_PATH"
  fi

  local plist="${APP_PATH}/Contents/Info.plist"
  local version; version="$(config_version)"
  [[ -n "$version" ]] || fail "Could not read version from package.json"
  local number; number="$(date -u +%Y%m%d.%H%M)"
  echo "$number" > "$BUILD_NUMBER_FILE"

  plist_set "$plist" CFBundleIdentifier string "$BUNDLE_ID"
  plist_set "$plist" CFBundleShortVersionString string "$version"
  plist_set "$plist" CFBundleVersion string "$number"
  plist_set "$plist" LSApplicationCategoryType string public.app-category.developer-tools
  plist_set "$plist" ITSAppUsesNonExemptEncryption bool false
  plist_set "$plist" LSMinimumSystemVersion string "$MIN_MACOS"
  plist_set "$plist" CFBundleDisplayName string Postbird

  # Electrobun keeps its own copy of the identifier. An empty baseUrl gives its
  # updater nowhere to fetch from (guideline 2.4.5(vii): the App Store updates us).
  local vjson="${APP_PATH}/Contents/Resources/version.json"
  if [[ -f "$vjson" ]]; then
    local tmp; tmp="$(mktemp)"
    jq --arg id "$BUNDLE_ID" '.identifier = $id | .baseUrl = ""' "$vjson" > "$tmp" && mv "$tmp" "$vjson"
  fi
  local meta="${APP_PATH}/Contents/Resources/metadata.json"
  if [[ -f "$meta" ]]; then
    local tmp; tmp="$(mktemp)"
    jq --arg id "$BUNDLE_ID" '.identifier = $id' "$meta" > "$tmp" && mv "$tmp" "$meta"
  fi

  # Updater leftovers: no self-update inside the App Store.
  rm -f "${APP_PATH}/Contents/MacOS/bspatch" "${APP_PATH}/Contents/MacOS/zig-zstd"
  rm -rf "${APP_PATH}/Contents/_CodeSignature"

  if [[ "$mode" == "appstore" ]]; then
    ensure_profile
    cp "$PROFILE_PATH" "${APP_PATH}/Contents/embedded.provisionprofile"
  fi

  # The launcher links only libSystem, so AppKit's LaunchServices check-in
  # happens too late and the sandbox denies it. Link Cocoa at load time
  # (blackboardsh/electrobun#519, applied to the shipped binary).
  local launcher="${APP_PATH}/Contents/MacOS/$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "$plist")"
  codesign --remove-signature "$launcher" 2>/dev/null || true
  bun "${REPO_ROOT}/scripts/appstore/add_cocoa_load_command.ts" "$launcher"
  otool -L "$launcher" | grep -q "Cocoa.framework" || fail "Launcher does not link Cocoa after patching"

  # mktemp creates 0600 files; the installer rejects root-only content (90255).
  chmod -R u+rwX,go+rX "$APP_PATH"

  xattr -cr "$APP_PATH"
  ok "Prepared ${APP_PATH}  (${BUNDLE_ID}  ${version} (${number}))"
}

# ── ICU (guideline 2.5.1: no non-public API) ──────────────────────────────────
# bun imports 177 C functions from /usr/lib/libicucore, which App Review's scan
# flags as non-public. The `icu` stage builds ICU once, links it into
# libpbicu.dylib with every symbol bun imports re-exported as _p<name minus the
# leading u>, and patches bun to import those names from @rpath/libpbicu.dylib.
ICU_VERSION="78.1"
ICU_MAJOR="${ICU_VERSION%%.*}"
ICU_SHA256="6217f58ca39b23127605cfc6c7e0d3475fe4b0d63157011383d716cb41617886"
ICU_URL="https://github.com/unicode-org/icu/releases/download/release-${ICU_VERSION}/icu4c-${ICU_VERSION}-sources.tgz"
ICU_DIR="${OUT_DIR}/icu-${ICU_VERSION}"
ICU_LIB="${ICU_DIR}/libpbicu.dylib"
OLD_ICU_DYLIB="/usr/lib/libicucore.A.dylib"

# Mach-O files under $1, NUL-free, one per line.
macho_files() {
  local f
  while IFS= read -r -d '' f; do
    file -b "$f" | grep -q 'Mach-O' && printf '%s\n' "$f"
  done < <(find "$1" -type f -print0)
}

# Build ICU as static arm64 libraries with renaming left on (_78 suffixes).
build_icu_static() {
  [[ -f "${ICU_DIR}/install/lib/libicuuc.a" && -f "${ICU_DIR}/install/lib/libicui18n.a" \
     && -f "${ICU_DIR}/install/lib/libicudata.a" ]] && return
  step "ICU ${ICU_VERSION}: download and build (cached in ${ICU_DIR})"
  rm -rf "${ICU_DIR}/download" "${ICU_DIR}/src" "${ICU_DIR}/build" "${ICU_DIR}/install"
  mkdir -p "${ICU_DIR}/download" "${ICU_DIR}/src" "${ICU_DIR}/build"

  local tgz="${ICU_DIR}/download/icu4c-${ICU_VERSION}-sources.tgz" got
  curl -fsSL --retry 3 -o "$tgz" "$ICU_URL"
  got="$(shasum -a 256 "$tgz" | awk '{print $1}')"
  [[ "$got" == "$ICU_SHA256" ]] || fail "ICU source checksum mismatch.\n       expected ${ICU_SHA256}\n       got      ${got}"
  tar -xzf "$tgz" -C "${ICU_DIR}/src" --strip-components=1

  local cc cxx flags sdk
  cc="$(xcrun -f clang)"; cxx="$(xcrun -f clang++)"; sdk="$(xcrun --sdk macosx --show-sdk-path)"
  flags="-arch arm64 -isysroot ${sdk} -mmacosx-version-min=${MIN_MACOS} -O2 -fPIC"
  (
    cd "${ICU_DIR}/build"
    CC="$cc" CXX="$cxx" CFLAGS="$flags" CXXFLAGS="$flags -std=c++17" LDFLAGS="-arch arm64 -isysroot ${sdk} -mmacosx-version-min=${MIN_MACOS}" \
      "${ICU_DIR}/src/source/configure" --prefix="${ICU_DIR}/install" \
        --enable-static --disable-shared --with-data-packaging=static \
        --disable-extras --disable-tests --disable-samples
    make -j"$(sysctl -n hw.ncpu)"
    make install
  )
  [[ -f "${ICU_DIR}/install/lib/libicudata.a" ]] || fail "ICU build produced no libicudata.a"
  ok "Built ICU ${ICU_VERSION}"
}

# The ICU imports of $1, one name per line (e.g. _ubrk_clone).
icu_imports() {
  nm -m "$1" | sed -n 's/.*external \(_[A-Za-z0-9_]*\) (from libicucore)$/\1/p' | sort -u
}

# Link libpbicu.dylib with an alias for each name in $1 (one per line).
link_pbicu() {
  local names="$1" lib="${ICU_DIR}/install/lib" name defined missing=""
  defined="$(nm -gU "${lib}/libicuuc.a" "${lib}/libicui18n.a" 2>/dev/null | awk 'NF==3 && $2 ~ /^[TDSBt]$/ {print $3}' | sort -u)"

  local args=() exports="${ICU_DIR}/exports.txt" n=0
  : > "$exports"
  while IFS= read -r name; do
    [[ -n "$name" ]] || continue
    [[ "$name" == _u* ]] || fail "Unexpected non-ICU-looking import from libicucore: ${name}"
    if ! grep -qx -- "${name}_${ICU_MAJOR}" <<<"$defined"; then missing+="  ${name}\n"; continue; fi
    args+=("-Wl,-alias,${name}_${ICU_MAJOR},_p${name#_u}")
    echo "_p${name#_u}" >> "$exports"
    n=$((n + 1))
  done <<<"$names"
  [[ -z "$missing" ]] || fail "bun imports these from libicucore, but ICU ${ICU_VERSION} has no such function:\n${missing}       (Apple-only extras; not guessing.)"

  "$(xcrun -f clang++)" -arch arm64 -dynamiclib -isysroot "$(xcrun --sdk macosx --show-sdk-path)" \
    -mmacosx-version-min="${MIN_MACOS}" \
    -install_name "@rpath/libpbicu.dylib" \
    -Wl,-force_load,"${lib}/libicuuc.a" -Wl,-force_load,"${lib}/libicui18n.a" -Wl,-force_load,"${lib}/libicudata.a" \
    "${args[@]}" -Wl,-exported_symbols_list,"$exports" -lc++ -o "$ICU_LIB"
  echo "   linked ${ICU_LIB} (${n} aliased exports)"
}

# JSON of a few Intl results, to prove the patched bun still has working ICU.
ICU_SMOKE='const r=[Intl.DateTimeFormat("sv-SE",{dateStyle:"full"}).format(0),new Intl.Collator("de").compare("ä","z"),"ß".localeCompare("ss","de"),[...new Intl.Segmenter("th").segment("สวัสดี")].map(s=>s.segment),Intl.supportedValuesOf("timeZone").length>400];console.log(JSON.stringify(r))'

icu_smoke_test() { # <patched bun> <pristine bun>
  local patched="$1" pristine="$2" tmp; tmp="$(mktemp -d -t icu-smoke-XXXXXX)"
  # Ad-hoc sign scratch copies: arm64 kills unsigned binaries.
  cp "$patched" "${tmp}/bun-patched"; cp "$ICU_LIB" "${tmp}/libpbicu.dylib"
  cp "$pristine" "${tmp}/bun-pristine"
  codesign --force --sign - "${tmp}/libpbicu.dylib" "${tmp}/bun-patched" "${tmp}/bun-pristine" 2>/dev/null
  local a b c
  a="$(TZ=UTC "${tmp}/bun-patched" -e "$ICU_SMOKE")"  || { rm -rf "$tmp"; fail "Patched bun failed the Intl smoke test"; }
  b="$(TZ=UTC "${tmp}/bun-pristine" -e "$ICU_SMOKE")" || { rm -rf "$tmp"; fail "Pristine bun failed the Intl smoke test"; }
  echo "   patched : $a"; echo "   pristine: $b"
  [[ "$a" == "$b" ]] || { rm -rf "$tmp"; fail "Intl output differs between patched and unpatched bun"; }
  if command -v bun >/dev/null; then
    c="$(TZ=UTC bun -e "$ICU_SMOKE" 2>/dev/null || true)"
    [[ "$c" == "$a" ]] && echo "   system bun matches" || echo "⚠️   system bun differs (version skew?): $c"
  fi
  rm -rf "$tmp"
}

icu_guards() {
  local bunbin="${APP_PATH}/Contents/MacOS/bun" f n bad=""
  n="$(nm -m "$bunbin" | grep -c libicucore || true)"
  [[ "$n" == "0" ]] || fail "bun still imports ${n} symbols from libicucore."
  while IFS= read -r f; do
    # Undefined _u*_ names, except the ones libSystem (uuid_*, ...) and libedit
    # (using_history) export. ICU only ever comes from libicucore.
    bad+="$(nm -m "$f" 2>/dev/null | grep '(undefined)' | grep -Ev 'from (libSystem|libedit)' \
            | grep -E 'external _u[a-z]*_' | sed "s|^|${f#"$APP_PATH"/}: |" || true)"
    if otool -L "$f" 2>/dev/null | grep -q '/usr/lib/libicucore'; then
      fail "${f#"$APP_PATH"/} links /usr/lib/libicucore"
    fi
  done < <(macho_files "$APP_PATH")
  [[ -z "$bad" ]] || fail "Undefined ICU-style symbols remain:\n${bad}"
  ok "No libicucore import or undefined ICU symbol anywhere in the bundle"
}

do_icu() {
  step "2b ICU (private, renamed)"
  [[ -d "$APP_PATH" ]] || fail "${APP_PATH} not found. Run 'prepare' first."
  local bunbin="${APP_PATH}/Contents/MacOS/bun"
  [[ -f "$bunbin" ]] || fail "${bunbin} not found."

  if [[ -n "$(icu_imports "$bunbin")" ]]; then
    build_icu_static
    local names; names="$(icu_imports "$bunbin")"
    echo "   $(wc -l <<<"$names" | tr -d ' ') ICU imports to re-point"
    link_pbicu "$names"

    local pristine="${OUT_DIR}/bun.pristine"
    cp "$bunbin" "$pristine"
    bun "${REPO_ROOT}/scripts/appstore/patch_bun_icu.ts" "$bunbin"
    cp "$ICU_LIB" "${APP_PATH}/Contents/MacOS/libpbicu.dylib"
    # codesign --remove-signature left bun unsigned; the pristine copy is
    # still signed and only used for the comparison below.
    otool -L "$bunbin" | grep -q '@rpath/libpbicu.dylib' || fail "bun does not import @rpath/libpbicu.dylib"
    icu_smoke_test "$bunbin" "$pristine"
    rm -f "$pristine"
  else
    [[ -f "${APP_PATH}/Contents/MacOS/libpbicu.dylib" ]] || fail "bun has no libicucore imports but libpbicu.dylib is missing."
    echo "   bun is already patched"
  fi
  icu_guards
  ok "bun now uses the bundled ICU ${ICU_VERSION}"
}

# do_sign <identity-sha1> <app-entitlements-file>
sign_bundle() {
  local identity="$1" app_ent="$2" f kind
  local libs=() execs=() main
  main="${APP_PATH}/Contents/MacOS/$(/usr/libexec/PlistBuddy -c 'Print :CFBundleExecutable' "${APP_PATH}/Contents/Info.plist")"

  while IFS= read -r -d '' f; do
    [[ "$f" == "$main" ]] && continue
    kind="$(file -b "$f")"
    case "$kind" in
      *Mach-O*"shared library"*|*Mach-O*bundle*) libs+=("$f") ;;
      *Mach-O*executable*)                        execs+=("$f") ;;
    esac
  done < <(find "$APP_PATH" -type f -print0)

  local cs=(codesign --force --timestamp --options runtime --sign "$identity")
  for f in "${libs[@]}";  do "${cs[@]}" "$f"; done
  for f in "${execs[@]}"; do "${cs[@]}" --entitlements "${ENT_DIR}/Child.entitlements" "$f"; done
  "${cs[@]}" --entitlements "$app_ent" "$APP_PATH"

  echo "   signed ${#libs[@]} libraries, ${#execs[@]} helper executables, and the app"
}

do_sign() {
  step "3  Sign (Apple Distribution)"
  [[ -d "$APP_PATH" ]] || fail "${APP_PATH} not found. Run 'prepare' first."
  local identity; identity="$(find_identity "$APP_IDENTITY_LABEL")"
  [[ -n "$identity" ]] || fail "No '${APP_IDENTITY_LABEL}' identity in the keychain."

  local prof="${APP_PATH}/Contents/embedded.provisionprofile" want have
  [[ -f "$prof" ]] || fail "Profile not embedded. Run 'prepare' first."
  want="$(profile_leaf_sha1 "$prof")" || fail "Could not read the profile's certificate."
  have="$(security find-certificate -a -Z -c "$APP_IDENTITY_LABEL" 2>/dev/null \
          | awk '/SHA-1 hash:/{print toupper($3)}' | grep -x "$want" || true)"
  [[ -n "$have" ]] || fail "The profile's signing cert (${want}) is not in the keychain."
  identity="$want"

  sign_bundle "$identity" "${ENT_DIR}/Postbird.entitlements"
  codesign --verify --deep --strict --verbose=2 "$APP_PATH"
  verify_codesign_matches_profile
  ok "Signed ${APP_PATH}"
}

do_pkg() {
  step "4  Package"
  [[ -d "$APP_PATH" ]] || fail "${APP_PATH} not found."
  local identity; identity="$(find_identity "$INSTALLER_IDENTITY_LABEL")"
  [[ -n "$identity" ]] || fail "No '${INSTALLER_IDENTITY_LABEL}' identity in the keychain."
  rm -f "$PKG_PATH"
  xcrun productbuild --sign "$identity" --component "$APP_PATH" /Applications "$PKG_PATH"
  pkgutil --check-signature "$PKG_PATH"
  ok "Packaged ${PKG_PATH}"
}

do_validate() {
  step "5a Validate"
  [[ -f "$PKG_PATH" ]] || fail "${PKG_PATH} not found. Run 'pkg' first."
  asc apps validate "$PKG_PATH"
  ok "Validated"
}

do_upload() {
  step "5b Upload"
  [[ -f "$PKG_PATH" ]] || fail "${PKG_PATH} not found. Run 'pkg' first."
  asc apps upload "$PKG_PATH"
  ok "Uploaded build $(cat "$BUILD_NUMBER_FILE" 2>/dev/null) to app ${APP_ID}"
}

# Local smoke test. An Apple Distribution app only launches from an App Store
# install, so sign with Apple Development and drop the keys that need a profile.
do_sandbox_test() {
  step "6  Sandbox test"
  do_prepare dev
  do_icu
  local identity; identity="$(find_team_dev_identity)"
  [[ -n "$identity" ]] || fail "No valid 'Apple Development' identity for team ${TEAM_ID} in the keychain."
  local ent="${OUT_DIR}/Postbird.dev.entitlements"
  cp "${ENT_DIR}/Postbird.entitlements" "$ent"
  /usr/libexec/PlistBuddy -c "Delete :com.apple.application-identifier" "$ent"
  /usr/libexec/PlistBuddy -c "Delete :com.apple.developer.team-identifier" "$ent"
  sign_bundle "$identity" "$ent"
  codesign --verify --deep --strict --verbose=2 "$APP_PATH"
  ok "Dev-signed sandboxed app: open '${APP_PATH}'"
  echo "   Watch denials:  log stream --predicate 'eventMessage CONTAINS \"Sandbox: \" AND eventMessage CONTAINS \"deny\"'"
}

case "${1:-all}" in
  build)        do_build ;;
  prepare)      do_prepare appstore ;;
  sign)         do_sign ;;
  pkg)          do_pkg ;;
  validate)     do_validate ;;
  upload)       do_upload ;;
  icu)          do_icu ;;
  sandbox-test) do_sandbox_test ;;
  all)          do_build; do_prepare appstore; do_icu; do_sign; do_pkg; do_validate; do_upload ;;
  *) echo "Usage: $0 [build|prepare|icu|sign|pkg|validate|upload|sandbox-test|all]" >&2; exit 1 ;;
esac
