#!/usr/bin/env bash
# Print the sha256 stanza for packaging/homebrew/postbird.rb.
# Usage: scripts/homebrew_cask_sha.sh <version>   (e.g. 0.9.2, no leading "v")
# Only reads from GitHub; fails if either macOS DMG is missing from the release.
set -euo pipefail

version="${1:-}"
if [[ -z "$version" ]]; then
  echo "usage: $0 <version>" >&2
  exit 2
fi
version="${version#v}"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

download_sha() {
  local asset="$1"
  if ! gh release download "v${version}" --repo Paxa/postbird \
      --pattern "$asset" --dir "$tmp" 2>"$tmp/err"; then
    echo "error: v${version} has no ${asset} asset" >&2
    cat "$tmp/err" >&2
    exit 1
  fi
  shasum -a 256 "$tmp/$asset" | cut -d' ' -f1
}

arm_sha="$(download_sha "Postbird-macos-arm64.dmg")"
intel_sha="$(download_sha "Postbird-macos-x64.dmg")"

printf '  sha256 arm:   "%s",\n         intel: "%s"\n' "$arm_sha" "$intel_sha"
