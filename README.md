# Postbird

Postbird is a cross-platform PostgreSQL GUI client, written in JavaScript, runs with Electron

<img src="https://user-images.githubusercontent.com/26019/41055418-dcc55700-69f3-11e8-8d3e-572cf5febedc.png" alt="Connection Screen" width=65%>
<img src="https://user-images.githubusercontent.com/26019/41055416-dc5a5464-69f3-11e8-87b8-994e763da816.png" alt="Table Content" width=65%>
<img src="https://user-images.githubusercontent.com/26019/41055417-dc8eb56a-69f3-11e8-8145-6f0d5eb147a6.png" alt="Table Structure" width=65%>

## Download

**Version 0.8.1**

MacOS: [Postbird-0.8.1.dmg](https://github.com/Paxa/postbird/releases/download/0.8.1/Postbird-0.8.1.dmg) - MacOS 10.9+

Linux packages: [Postbird_0.8.1_amd64.deb](https://github.com/Paxa/postbird/releases/download/0.8.1/Postbird_0.8.1_amd64.deb) [Postbird-0.8.1.x86_64.rpm](https://github.com/Paxa/postbird/releases/download/0.8.1/Postbird-0.8.1.x86_64.rpm) [Postbird_0.8.1_amd64.snap](https://github.com/Paxa/postbird/releases/download/0.8.1/Postbird_0.8.1_amd64.snap)<br>
Via snap:
```
sudo snap install postbird
```
Snap page: https://snapcraft.io/postbird

Windows installer: [Postbird.Setup.0.8.1.exe](https://github.com/Paxa/postbird/releases/download/0.8.1/Postbird.Setup.0.8.1.exe)<br>
Windows portable: [Postbird-0.8.1-win.zip](https://github.com/Paxa/postbird/releases/download/0.8.1/Postbird-0.8.1-win.zip)

Latest artifacts: https://postbird.paxa.kuber.host/

## Development

[ ![Codeship Status for Paxa/postbird](https://app.codeship.com/projects/c2450da0-9339-0135-ee6d-1663622ccf5e/status?branch=master)](https://app.codeship.com/projects/250798)
[![Build Status](https://travis-ci.org/Paxa/postbird.svg?branch=master)](https://travis-ci.org/Paxa/postbird)


Pull requests and suggestions are welcome

To run newest version, simply:

```sh
git clone git@github.com:Paxa/postbird.git
cd postbird
yarn
yarn rebuild_ext
yarn start
```

Build package:
```sh
yarn dist
ls ./dist
```

See [CONTRIBUTING.md](/CONTRIBUTING.md) for more details
