# Postbird

Postbird is a cross-platform PostgreSQL GUI client, written in JavaScript, runs with Electron

![postbird-screenshot](https://user-images.githubusercontent.com/26019/41055418-dcc55700-69f3-11e8-8d3e-572cf5febedc.png)

![postbird-table-screenshot](https://user-images.githubusercontent.com/26019/41055416-dc5a5464-69f3-11e8-87b8-994e763da816.png)

![postbird-structure-screenshot](https://user-images.githubusercontent.com/26019/41055417-dc8eb56a-69f3-11e8-8145-6f0d5eb147a6.png)

## Download

**Version 0.8.0**

[Postbird-0.8.0.dmg](https://github.com/Paxa/postbird/releases/download/0.8.0/Postbird-0.8.0.dmg) - OS X 10.9+ 64bit

## Development

[ ![Codeship Status for Paxa/postbird](https://app.codeship.com/projects/c2450da0-9339-0135-ee6d-1663622ccf5e/status?branch=master)](https://app.codeship.com/projects/250798)

Pull requests and suggestions are welcome

To run newest version, simply:

```sh
git clone git@github.com:Paxa/postbird.git
cd postbird
PATH=$PATH:/Applications/Postgres.app/Contents/Versions/latest/bin/ # to compile postgres native extension
npm install
npm run rebuild_ext
./run
```

To install it on Linux:

```sh
git clone git@github.com:Paxa/postbird.git
cd postbird
yarn
yarn dist
sudo apt install ./dist/Postbird_0.8.0_XXX.deb
```

See [CONTRIBUTING.md](/CONTRIBUTING.md) for more details
