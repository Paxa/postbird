#!/usr/bin/env bash
# Print the sha256 lines for packaging/homebrew/postbird.rb.
# Usage: scripts/homebrew_cask_sha.sh <version>   (e.g. 0.9.1, no leading "v")
# Only reads from GitHub; fails if either DMG is missing from the release.
set -euo pipefail

version="${1:-}"
if [[ -z "$version" ]]; then
  echo "usage: $0 <version>" >&2
  exit 2
fi
version="${version#v}"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

for arch in arm64 x64; do
  if ! gh release download "v${version}" --repo Paxa/postbird \
      --pattern "Postbird-macos-${arch}.dmg" --dir "$tmp" 2>"$tmp/err"; then
    echo "error: v${version} has no Postbird-macos-${arch}.dmg asset" >&2
    cat "$tmp/err" >&2
    exit 1
  fi
done

arm="$(shasum -a 256 "$tmp/Postbird-macos-arm64.dmg" | cut -d' ' -f1)"
x64="$(shasum -a 256 "$tmp/Postbird-macos-x64.dmg" | cut -d' ' -f1)"

printf 'sha256 arm:   "%s",\n       intel: "%s"\n' "$arm" "$x64"
