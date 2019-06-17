## Setup Environment

You gonna need any, not too old, version of nodejs and npm. Ruby (already installed in Mac), command line tools from Apple for compiling Postgres native extension.

    npm install
    npm run rebuild_ext

## Run from source code:

    ./run

It will open app with web inspector, also in development mode exceptions not being reported

## Recompile CSS

    yarn run sass

It will automatically recompile if any scss files are changed, to update css without reloading use `reloadCss()` in dev tools.

## Compiling dependencies for release

Postbird using cpmmand line utils for importing and exporting sql dumps, also for generating table source.
That binaries have dependencies for shared libraries (postgres internal stuf), for easier life I put it to repo.
For compiling instructions see `BUILDING_DEPS.md`. This only required for updating postgres version

## Building Prostbird.app

```
# make sure you have ran "yarn rebuild_ext"
yarn dist
```

### Code Structure

* `lib` folder contains some helper modules (some probably not used anymore)
* `assets` - contain scss files and some images
* `app` - main files
* `app/views` - everything related to visual elements
* `app/models` - data layer, interfaces and object wrappers to access db entities
* `app/window_handlers` - additional windows
* `app/controllers` - I move some functions to controllers (actually still figuring out what will be the right structure of code)
* `app/components` -  some common functions
* `app/login_components` - parts of login screen

## Writing Code

This code doesn't use any framework for organizing models and views, just plain javascript that use native DOM API and jQuery to manipulate DOM elements,
pug for templates and 3rd party libraries for some features. Most of files are classes registered as global variable.

You may be wondering why do I need `views/cache.js`, it's template cache for all pug files,
it makes rendering html much faster. Pug runtime (something that consume cache.js and generate html) is very fast to load and fast to execute,
and pug compiler is slow to load. Code will try always use cache if file's md5 remain same, this trick helps to load application faster.

Some templates contain something like `<a exec="install(123)">...</a>`, that is shortcut for binding click event to some method in
related view handler. I prefer to use CSS classes only for defining appearence and some semantics, and for defining logic I use other attributes.

To reoad Postbird app use Cmd+Shift+R, useful while developing

---

If you want have any questions, I will be glad to answer it! Don't be shy :)
