## Setup Environment

You gonna need any, not too old, version of nodejs and npm. Ruby (already installed in Mac), command line tools from Apple for compiling Postgres native extension.

    npm install
    npm run rebuild_ext

## Run from source code:

    ./run

It will open app with web inspector, also in development mode exceptions not being reported

## Recompile CSS

    yarn run sass

## Compiling dependencies for release

Postbird using cpmmand line utils for imporing and exporing sql dumps, also for generating table source.
That binaries have dependencies for shared libraries (postgres internal stuf), for easier life I put it to repo.
For compiling instructions see BUILDING_DEPS.md. This only required for updating postgres version

## Building Prostbird.app

Electron packager or npm has a bug, it may include developer dependecies to release and result file will be bloated.
As a workaround, before creating package need to delete developer dependecies from package.json and run `npm prune`

```
# make sure you have ran "rake rebuild_ext"
# delete "devDependencies" from package.json
npm prune
npm install -g electron-packager@13.0.0
npm install requireg
sudo npm install -g electron@3.0.10
node packager.js
rake build_dmg
```

## Writing Code

This code doesn't use any framework for organizing models and views, just plain javascript that use native DOM API and jQuery to manipulate DOM elements,
pug for templates and 3rd party libraries for some features. Most of files are classes registed as global variable,
I use native clsses and `jClass` utility for creating class objects (for some old parts) (File `lib/jquery.class.js`)

### Code Structure

* `lib` folder contains some helper modules (some probably not used anymore)
* `assets` - contain scss files and some images
* `app` - main files
* `app/views` - everything related to visual elements
* `app/models` - data layer, intefaces and object wrappers to access db entities
* `app/window_handlers` - additional windows
* `app/controllers` - I move some functions to controllers (actually still figuring out what will be the right structure of code)

You may be wondering why do I need `views/cache.js`, it's template cache for all pug files,
it makes rendering html much faster. Pug runtime (something that consume cache.js and generate html) is very fast to load and fast to execute,
and pug compiler is slow to load. Code will try always use cache if file's md5 remain same, this trick helps to load application faster.

Some templates contain something like `<a exec="install(123)">...</a>`, that is shortcut for binding click event to some method in
related view handler. I prefer to use CSS classes only for defining appearence and some semantics, and for defining logic I use other attributes.

If you want have any questions, I will be glad to answer it! Don't be shy :)
