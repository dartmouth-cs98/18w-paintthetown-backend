import passport from 'passport';
import LocalStrategy from 'passport-local';
import FacebookStrategy from 'passport-facebook';
import FacebookTokenStrategy from 'passport-facebook-token';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import config from '../config';

// and import User and your config with the secret
import User from '../models/user_model';

// options for local strategy, we'll use email AS the username
// not have separate ones
const localOptions = { usernameField: 'email' };

const CALLBACK_URLS = {
  // webBrowser: 'https://paint-the-town.surge.sh/',
  webBrowser: 'http://localhost:8080/',
};

const facebookOptions = {
  clientID: config.facebookAppId,
  clientSecret: config.facebookAppSecret,
  // profileFields: ['id', 'email', 'name'],
  // passReqToCallback: true,
};
//
// const DEFAULT_FACEBOOK_LOGIN = newFacebookLogin(Object.assign({
//   callbackURL: CALLBACK_URLS.webBrowser,
// }, facebookOptions));

// options for jwt strategy
// we'll pass in the jwt in an `authorization` header
// so passport can find it there
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeader('authorization'),
  secretOrKey: config.secret,
};

// username + password authentication strategy
const localLogin = new LocalStrategy(localOptions, (emailRaw, password, done) => {
  // Verify this email and password, call done with the user
  // if it is the correct email and password
  // otherwise, call done with false
  const email = emailRaw.toLowerCase();

  User.findOne({ email }, (err, user) => {
    if (err) { return done(err); }

    if (!user) { return done(null, false); }

    // compare passwords - is `password` equal to user.password?
    return user.comparePassword(password, (err, isMatch) => {
      if (err) {
        console.log(err);
        return done(err);
      }

      if (!isMatch) { return done(null, false); }

      return done(null, user);
    });
  });
});

function newFacebookLogin(opts) {
  return new FacebookStrategy(opts, (req, token, refreshToken, profile, done) => {
    const data = profile._json;
    const { email } = data;

    User.findOne({ email }, (err, user) => {
      if (err) { return done(err); }
      if (user) { return done(null, user); }

      const newUser = new User();

      newUser.name = data.first_name;
      newUser.lastName = data.last_name;
      newUser.email = data.email;
      newUser.typeOfLogin = 'facebook';

      return newUser.save()
      .then(result => {
        console.log(`POST:\tFacebook user added ${newUser.name} ${newUser.lastName}.`);
        return done(null, newUser);
      })
      .catch(err => (done(err)));
    });
  });
}

const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  // See if the user ID in the payload exists in our database
  // If it does, call 'done' with that other
  // otherwise, call done without a user object
  User.findById(payload.sub, (err, user) => {
    if (err) {
      done(err, false);
    } else if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

// Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);
// passport.use(DEFAULT_FACEBOOK_LOGIN);

passport.use(new FacebookTokenStrategy(facebookOptions, (accessToken, refreshToken, profile, done) => {
  console.log(profile, accessToken);
}));

// export const requireAuth = passport.authenticate('facebook-token');

// export const requireAuthFacebook = (req, res, next, callback) => {
//   passport.authenticate('facebook', (err, user) => {
//     if (err) { return res.json({ error: err }); }
//     return callback(Object.assign({ user }, req), res);
//   })(req, res, next);
// };

export const requireAuthFacebook = (req, res, next, callback) => {
  passport.authenticate('facebook-token', (err, user) => {
    if (err) { return res.json({ error: err }); }
    return callback(Object.assign({ user }, req), res);
  })(req, res, next);
};

export const requireAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false })(req, res, next);
};

export const requireLoginFacebook = (req, res, next) => {
  const userAgent = req.headers['user-agent'];

  if (!userAgent) {
    return res.json({ error: 'Unknown user agent' });
  }

  let requesterType = null;

  if (userAgent.indexOf('Mozilla') > -1 || userAgent.indexOf('Chrome') > -1 ||
      userAgent.indexOf('Safari') > -1) {
    requesterType = 'webBrowser';
  }

  if (requesterType === null) {
    console.log(userAgent);
    return res.json({ error: 'Unknown user agent' });
  }

  const callbackURL = CALLBACK_URLS[requesterType];

  const facebookLogin = newFacebookLogin(
    Object.assign({ callbackURL }, facebookOptions),
  );

  passport.use(facebookLogin);

  return passport.authenticate('facebook', {
    scope: ['public_profile', 'email'],
  })(req, res, next);
};

export const requireSignin = passport.authenticate('local', { session: false });
