#!/usr/bin/env bash
# Print the sha256 line for packaging/homebrew/postbird.rb.
# Usage: scripts/homebrew_cask_sha.sh <version>   (e.g. 0.9.1, no leading "v")
# Only reads from GitHub; fails if the arm64 DMG is missing from the release.
# The cask is arm64 only until the Electrobun build tool runs on Intel Macs.
set -euo pipefail

version="${1:-}"
if [[ -z "$version" ]]; then
  echo "usage: $0 <version>" >&2
  exit 2
fi
version="${version#v}"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

asset="Postbird-macos-arm64.dmg"
if ! gh release download "v${version}" --repo Paxa/postbird \
    --pattern "$asset" --dir "$tmp" 2>"$tmp/err"; then
  echo "error: v${version} has no ${asset} asset" >&2
  cat "$tmp/err" >&2
  exit 1
fi

printf 'sha256 "%s"\n' "$(shasum -a 256 "$tmp/$asset" | cut -d' ' -f1)"
