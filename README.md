# Postbird 
[![Build and Release](https://github.com/Paxa/postbird/actions/workflows/build.yml/badge.svg)](https://github.com/Paxa/postbird/actions/workflows/build.yml)
[![Backers on Open Collective](https://opencollective.com/postbird/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/postbird/sponsors/badge.svg)](#sponsors)

Postbird is an open-source, ultra-fast cross-platform PostgreSQL GUI client written in TypeScript and powered by **Electrobun & Bun**.

* **Ultra-low RAM:** ~45MB idle memory footprint (compared to ~250MB on Electron).
* **Instant Startup:** Sub-80ms cold boot via native OS WebKit/WebView2 webviews.
* **Compact Downloads:** Standalone macOS DMG is only ~28MB.
* **Modern PostgreSQL 18.2:** Bundled dump and restore binaries with automatic macOS Gatekeeper bypass.

<img src="https://user-images.githubusercontent.com/26019/41055418-dcc55700-69f3-11e8-8d3e-572cf5febedc.png" alt="Connection Screen" width=65%>
<img src="https://user-images.githubusercontent.com/26019/41055416-dc5a5464-69f3-11e8-87b8-994e763da816.png" alt="Table Content" width=65%>
<img src="https://user-images.githubusercontent.com/26019/41055417-dc8eb56a-69f3-11e8-8145-6f0d5eb147a6.png" alt="Table Structure" width=65%>

## Download

**Latest Release (v0.9.0)**

* **macOS (Apple Silicon M1/M2/M3/M4):** [Postbird-macos-arm64.dmg](https://github.com/Paxa/postbird/releases/download/v0.9.0/Postbird-macos-arm64.dmg)
* **Windows (64-bit):** [Postbird-windows-x64.zip](https://github.com/Paxa/postbird/releases/download/v0.9.0/Postbird-windows-x64.zip)
* **Linux (x86_64):**
  * [.deb (Debian, Ubuntu, Mint)](https://github.com/Paxa/postbird/releases/download/v0.9.0/Postbird-linux-x64.deb)
  * [.rpm (Fedora, RHEL, openSUSE)](https://github.com/Paxa/postbird/releases/download/v0.9.0/Postbird-linux-x64.rpm)
  * [.AppImage (Universal)](https://github.com/Paxa/postbird/releases/download/v0.9.0/Postbird-linux-x64.AppImage)
* **Linux (ARM64 / AArch64):**
  * [.deb](https://github.com/Paxa/postbird/releases/download/v0.9.0/Postbird-linux-arm64.deb)
  * [.rpm](https://github.com/Paxa/postbird/releases/download/v0.9.0/Postbird-linux-arm64.rpm)
  * [.AppImage](https://github.com/Paxa/postbird/releases/download/v0.9.0/Postbird-linux-arm64.AppImage)

Via snap:
```sh
sudo snap install postbird
```
Snap page: https://snapcraft.io/postbird

## Development

Requires [Bun](https://bun.sh) (v1.2+).

To run locally in development mode:

```sh
git clone git@github.com:Paxa/postbird.git
cd postbird
bun install
bun start
```

Run tests:
```sh
# Unit tests
bun test

# Automated UI integration tests
bun run test:ui
```

Build standalone distribution package:
```sh
bun run dist
ls -la artifacts/
```

See [CONTRIBUTING.md](/CONTRIBUTING.md) for more details

## Help Project

Your donations will help to publish to app stores, more frequent releases, faster feature requests implementation.
Postbird at opencollective: https://opencollective.com/postbird

### Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="https://github.com/Paxa/postbird/graphs/contributors"><img src="https://opencollective.com/postbird/contributors.svg?width=890&button=false" /></a>


### Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/postbird#backer)]

<a href="https://opencollective.com/postbird#backers" target="_blank"><img src="https://opencollective.com/postbird/backers.svg?width=890"></a>


### Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/postbird#sponsor)]

<a href="https://opencollective.com/postbird/sponsor/0/website" target="_blank"><img src="https://opencollective.com/postbird/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/postbird/sponsor/1/website" target="_blank"><img src="https://opencollective.com/postbird/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/postbird/sponsor/2/website" target="_blank"><img src="https://opencollective.com/postbird/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/postbird/sponsor/3/website" target="_blank"><img src="https://opencollective.com/postbird/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/postbird/sponsor/4/website" target="_blank"><img src="https://opencollective.com/postbird/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/postbird/sponsor/5/website" target="_blank"><img src="https://opencollective.com/postbird/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/postbird/sponsor/6/website" target="_blank"><img src="https://opencollective.com/postbird/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/postbird/sponsor/7/website" target="_blank"><img src="https://opencollective.com/postbird/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/postbird/sponsor/8/website" target="_blank"><img src="https://opencollective.com/postbird/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/postbird/sponsor/9/website" target="_blank"><img src="https://opencollective.com/postbird/sponsor/9/avatar.svg"></a>


