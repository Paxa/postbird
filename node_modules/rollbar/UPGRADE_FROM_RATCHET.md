# Upgrading from node_ratchet

Execute:

    $ npm uninstall ratchetio

Then:

    $ npm install --save rollbar

Replace instances of `require('ratchetio')` with `require('rollbar')`. Optionally, rename the variable used for the module from `ratchet` to `rollbar`.

The new Rollbar library now reports to `api.rollbar.com` instead of `submit.ratchet.io`.