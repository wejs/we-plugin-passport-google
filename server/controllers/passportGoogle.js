module.exports = {
  page: function(req, res, next) {
    req.we.passport.authenticate('google', {
      scope: [
        'https://www.googleapis.com/auth/plus.me',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    })(req, res, next);
  },
  callback: function(req, res) {
    req.we.passport
    .authenticate('google', { failureRedirect: '/login' })(req, res, function (err) {
      if (err) {
        req.we.log.error('we-plugin-passport-google: Error on authenticate with google.strategy:', err);
        res.addMessage('error', 'auth.oauth.error');
      }

      // Successful authentication, redirect home.
      res.goTo('/');
    });
  }
}