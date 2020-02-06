module.exports = {
  page(req, res, next) {
    const GAuthConfigs  = req.we.config.passport.strategies.google;

    req.we.passport.authenticate('google', {
      scope: (GAuthConfigs.scope || [
        'profile',
        'email',
        'https://www.googleapis.com/auth/plus.me',
        'https://www.googleapis.com/auth/userinfo.email'
      ])
    })(req, res, next);
  },
  callback(req, res) {
    const we = req.we;
    const GAuthConfigs  = we.config.passport.strategies.google;

    we.passport
    .authenticate('google', {
      failureRedirect: GAuthConfigs.redirectUrlAfterFailure
    })(req, res, (err)=> {
      if (err) {
        we.log.error('we-plugin-passport-google: Error on authenticate with google.strategy:', {
          error: err
        });
        res.addMessage('error', 'auth.oauth.error');
      }

      // Successful authentication, redirect home.
      res.goTo(GAuthConfigs.redirectUrlAfterSuccess);
    });
  }
};