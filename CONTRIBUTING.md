## Setup Environment

You gonna need any, not too old, version of nodejs and npm. Ruby (already installed in Mac), command line tools from Apple for compiling postrs native extension.

    npm install
    rake rebuild_ext
    gem install sass

## Run from source code:

    ./run

It will open app with web inspector, also in development mode exceptions not being reported

## Recompile CSS

    ./run_sass

## Compiling dependencies for release

Postbird using cpmmand line utils for imporing and exporing sql dumps, also for generating table source. That binaries have dependencies for shared libraries (postgres internal stuf), for easier life I put it to repo. For compiling instructions see BUILDING_DEPS.md. This only required for updating postgres version

## Building Prostgres.app

```
node packager.js
```

## Writing Code

This code doesn't use any framework for organizing models and views, just plain javascript that use native DOM API and jQuery to manipulate DOM elements, jade (alredy pug) for templates and 3rd party libraries for some features. Most of files are classes registed as global variable, I use `jClass` utility for creating class objects (File `lib/jquery.class.js`)

### Code Structure

* `lib` folder contains some helper modules (some probably not used anymore)
* `assets` - contain scss files and some images
* `app` - main files
* `app/views` - everything related to visual elements
* `app/models` - data layer, intefaces and object wrappers to access db entities
* `app/window_handlers` - additional windows
* `app/controllers` - I move some functions to controllers (actually still figuring out what will be the right structure of code)

You may be wondering why do I need `views/cache.js`, it's template cache for all jade files, it makes rendering html much faster. Jade runtime (something that consume cache.js and generate html) is very fast to load and fast to execute, and jade compiler is slow to load. Code will try always use cache if file's md5 remain same, this trick helps to load application faster.

Some templates contain something like `<a exec="install(123)">...</a>`, that is shortcut for binding click event to some method in related view handler. I prefer to use CSS classes only for defining appearence and some semantics, and for defining logic I use other attributes.

If you want have any questions, I will be glad to answer it! Don't be shy :)
