# Change Log

**0.4.4**
- Fix a bug when `req.socket` was undefined. ([#33](https://github.com/rollbar/node_rollbar/pull/33))

**0.4.3**
- Support HTTP proxies. ([#32](https://github.com/rollbar/node_rollbar/pull/32))

**0.4.2**
- Fixed a bug that caused the library to crash if a request was provided but did not have a `headers` object. ([#31](https://github.com/rollbar/node_rollbar/pull/31))

**0.4.1**
- Fixed a bug that caused the library to crash if a request was provided but did not have a `connection` object.
- Added some error logging to the `uncaughtException` handler to output uncaught exceptions to the log and to log if there were any problems handling the uncaught exception.

**0.4.0**
- Set the default handler to be `inline` so that if the program crashes since some configurations will shut down before the `setInterval()` is fired.
  - To maintain v0.3 behavior, simply add `handler: 'setInterval'` to the config object passed to `rollbar.init()`.

**0.3.13**
- Allow environment and framework to be overridden by payload data.

**0.3.12**
- Fix param scrubbing failing when the value is null/undefined ([#30](https://github.com/rollbar/node_rollbar/pull/30))

**0.3.11**
- Add `handleErrorWithPayloadData` function, exposing more of the Rollbar API when reporting errors. ([#29](https://github.com/rollbar/node_rollbar/pull/29))

**0.3.10**
- Fix edge case where multiple errors were not handled correctly. ([#28](https://github.com/rollbar/node_rollbar/issues/28))

**0.3.9**
- Add `verbose` configuration option, `true` by default.

**0.3.8**
- Revert JSON escape change and fix bug with content-length header.

**0.3.7**
- Properly escape unicode in payloads to fix server-side json parsing

**0.3.6**
- Allow addRequestData to be overridden. ([#24](https://github.com/rollbar/node_rollbar/pull/24))

**0.3.5**
- Handles a situation where circular references could likely exist which may result in no payload being sent at all.

**0.3.4**
- Fix bug that was not properly serializing JSON when there were multiple references to the same object in the payload.

**0.3.3**
- Fix bug that caused error reports to be swallowed when the stacktrace contains files that cannot be read ([#22](https://github.com/rollbar/node_rollbar/pull/22))
- Parse CoffeeScript stack traces ([#23](https://github.com/rollbar/node_rollbar/pull/23))

**0.3.2**
- Added `json-stringify-safe` to handle circular object references properly in payload construction
- Use `console.error` instead of `util.error` due to deprecation

**0.3.1**
- Don't require options to be passed into `handleUncaughtExceptions`

**0.3.0**
- Change default environment to 'unspecified' instead of 'production'

**0.2.11**
- Optionally `process.exit()` in uncaught error handler and change default environment to 'production'

**0.2.10**
- Generate context using the request's route instead of using the path

**0.2.9**
- Save request context in item payload

**0.2.8**
- Add support for req.body parsing for all http methods and not just POST

**0.2.7**
- Add code_version configuration option

**0.2.6**
- Add ability to scrub request headers

**0.2.5**
- Added in `rollbar.reportMessageWithPayloadData() export for rollbar.js`

**0.2.4**
- Adding reportMessageWithPayloadData

**0.2.3**
- Allow setting the person using Passport convention

**0.2.2**
- Return the last API response

**0.2.1**
- Never allow notifier code to crash

**0.2.0**
- Rename to Rollbar
