class Dedupe {}

module.exports = {
  init: () => {},
  configureScope: (fn) => {
    try {
      fn({ setExtra: () => {} });
    } catch (e) {}
  },
  captureException: (e) => console.error(e),
  Dedupe,
};
