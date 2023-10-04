const User = require("../models/User");
const bcrypt = require("bcryptjs");
const localStrategy = require("passport-local").Strategy;

module.exports = function (passport) {
  passport.use(
    new localStrategy((username, password, done) => {
      User.findOne({ username: username }, (err, user) => {
        if (err) throw err;
        if (!user) return done(null, false);
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) throw err;
          if (result === true) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
      });
    })
  );

  passport.serializeUser((user, cb) => {
    cb(null, {  id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                bio: user.bio,
                posts: user.posts,
                followers: user.followers,
                following: user.following,
                favourites: user.favourites
    });
  });
  passport.deserializeUser((user, cb) => {
    User.findOne({ _id: user.id }, (err, user) => {
      const userInformation = {  id: user.id,
                  name: user.name,
                  username: user.username,
                  email: user.email,
                  bio: user.bio,
                  posts: user.posts,
                  followers: user.followers,
                  following: user.following,
                  favourites: user.favourites
      };
      cb(err, userInformation);
    });
  });
};
