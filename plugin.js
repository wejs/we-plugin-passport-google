/**
 * Plugin.js file, set configs, routes, hooks and events here
 *
 * see http://wejs.org/docs/we/extend.plugin
 */
module.exports = function loadPlugin(projectPath, Plugin) {
  const plugin = new Plugin(__dirname);
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
          findUser(token, tokenSecret, profile, done) {
            const we = this.we;

            we.log.verbose('profile from google:', profile);

            // get email
            let email;
            for (let i = 0; i < profile.emails.length; i++) {
              if (profile.emails[i].type == 'account') {
                email = profile.emails[i].value;
                break;
              }
            }
            let query = {
              where: { email: email },
              defaults: {
                displayName: profile.displayName,
                fullName: profile.displayName,
                acceptTerms: true,
                active: true,
                email: email,
                googleId: profile.id,
                confirmEmail: email
              }
            };
            // save gender
            if (profile.gender == 'male') {
              query.defaults.gender = 'M';
            } else if(profile.gender == 'female') {
              query.defaults.gender = 'F';
            }

            we.db.models.user
            .findOrCreate(query)
            .spread( (user, created)=> {
              if (created) {
                we.log.info('New user from google oauth2', user.id);
              } else if(user.blocked) {
                we.log.info('G:User blocked trying to login:', user.id);
                done('user.blocked.cant.login', null);
                return null;
              }

              // activate user with google auth...
              if(!user.active) user.active = true;
              // set google Id if not set:
              if (!user.googleId) user.googleId = profile.id;

              return user.save()
              .then( ()=> {
                plugin.saveUserAvatar(profile, user, we, (err, image)=> {
                  done(null, user);
                  if (image) user.avatar = [image];
                  return null;
                });
              });
            })
            .catch(done);
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
      we.config.passport.strategies.google.callbackURL = we.config.hostname+'/auth/google/callback';
    }
  });

  plugin.saveUserAvatar = function(profile, user, we, cb) {
    const plf = we.plugins['we-plugin-file-local'];
    if (!plf) return cb();

    if (user && user.avatar && user.avatar.length) return cb();

    if (!profile.photos && !profile.photos[0]) return cb();

    const uU = plf.urlUploader;
    const url = profile.photos[0].value.replace('sz=50', 'sz=250');

    uU.uploadFromUrl(url, we, (err, image)=> {
      if (err) return cb(err);
      image.setCreator(user.id)
      .then( ()=> {
        user.avatar = [image];
        return user.save();
      })
      .then( ()=> {
        we.log.verbose('new image:', image.get());
        cb(null, image);
        return null;
      });
    });

  };

  return plugin;
};