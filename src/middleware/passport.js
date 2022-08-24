/** @format */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const { google, facebook, hostname, version } = require('../config');

passport.use(
  new GoogleStrategy(
    {
      clientID: google.clientID,
      clientSecret: google.clientSecret,
      callbackURL:
        `${hostname}/${version}/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, { profile });
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: facebook.clientID,
      clientSecret: facebook.clientSecret,
      callbackURL:
        `${hostname}/${version}/auth/facebook/callback`,
      profileFields: [
        'id',
        'emails',
        'displayName',
        'name',
        'photos',
      ],
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, { profile });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
