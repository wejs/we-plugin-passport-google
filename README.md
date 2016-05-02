# We.js plugin for add passoport authentication

> Plug passport-google-oauth npm module in we.js project with auth urls

## How to install

```sh
npm install we-plugin-passport-google --save
```

## How to configure

Passport strategies for authenticating with Google using OAuth 1.0a and OAuth 2.0.

This plugin lets you authenticate using Google in your We.js applications.

The client id and client secret needed to authenticate with Google can be set up from the developer's console Google Developer's Console: https://console.developers.google.com/project .

To configure in your project update the file: `config/locals.js` :

```js
// ...
  passport: {
    strategies: {
      google: {
        clientID: 'your google api client id',
        clientSecret: 'your google api client secret',
        // callbackURL: 'a custom callback url' // optional
      }
    }
  },
// ...
```

## API

#### Login with google url:

This url will start the authentication.

    'get /auth/google': {
      controller    : 'passportGoogle',
      action        : 'page',
      responseType  : 'json'
    },

#### Callback from google url:

    'get /auth/google/callback': {
      controller    : 'passportGoogle',
      action        : 'callback',
      responseType  : 'json'
    }


## Links

> * We.js site: http://wejs.org
> * Google passport npm module: https://github.com/jaredhanson/passport-google-oauth

## License

MIT
