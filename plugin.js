/**
 * Plugin.js file, set configs, routes, hooks and events here
 *
 * see http://wejs.org/docs/we/extend.plugin
 */
module.exports = function loadPlugin(projectPath, Plugin) {
  var plugin = new Plugin(__dirname);
  // set plugin configs
  plugin.setConfigs({
    passport: {
      strategies: {
        google: {
          Strategy: require('passport-google-oauth').OAuth2Strategy,
          // url to image icon
          icon: '/public/plugin/we-plugin-passport-google/files/images/g-logo.png',
          authUrl: '/auth/google',

          // get a clientID and clientSecret in google api console,
          // for docs see https://github.com/jaredhanson/passport-google-oauth
          clientID: null,
          clientSecret: null,
          // callbackURL is automaticaly set to we.config.hostname+'/auth/google/callback'
          // but you can change it in config/local.js
          callbackURL: null,
          session: true,
          findUser:   function(token, tokenSecret, profile, done) {
            var we = this.we;
            // get email
            var email;
            for (var i = 0; i < profile.emails.length; i++) {
              if (profile.emails[i].type == 'account') {
                email = profile.emails[i].value;
                break;
              }
            }
            var query = {
              where: { email: email },
              defaults: {
                displayName: profile.displayName,
                fullName: profile.displayName,
                acceptTerms: true,
                active: true,
                email: email,
                confirmEmail: email
              }
            };
            // save gender
            if (profile.gender == 'male') {
              query.defaults.gender = 'M';
            } else if(profile.gender == 'female') {
              query.defaults.gender = 'F';
            }

            we.db.models.user.findOrCreate(query).spread(function (user, created){
              if (created) we.log.info('New user from google oauth2', user.id);
              // TODO download and save user picture from google API

              return done(null, user);
            }).catch(done);
          }
        }
      }
    }
  });

  // ser plugin routes
  plugin.setRoutes({
    // Return a list of messages between authenticated user and :uid user
    'get /auth/google': {
      controller    : 'passportGoogle',
      action        : 'page',
      responseType  : 'json'
    },
    'get /auth/google/callback': {
      controller    : 'passportGoogle',
      action        : 'callback',
      responseType  : 'json'
    }
  });

  // use the bootstrap evento to set default auth callback
  plugin.events.on('we:after:load:express', function(we) {
    if (
      we.config.passport &&
      we.config.passport.strategies &&
      we.config.passport.strategies.google &&
      !we.config.passport.strategies.google.callbackURL
    ) {
      we.config.passport.strategies.google.callbackURL = we.config.hostname+'/auth/google/callback'
    }
  })

  return plugin;
};