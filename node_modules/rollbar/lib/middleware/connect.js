var notifier = require('../notifier');

module.exports = function connectMiddleware(accessToken, endpoint) {
    notifier = new notifier.Notifier(accessToken, endpoint);
    return function(err, req, res, next) {
        if (err) {
          notifier.addWebRequestError(req, err, function(result) {
            next(err, req, res);
          });
        } else {
          next(err, req, res);
        }
    };
};
