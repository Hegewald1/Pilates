const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/user");

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ 
      usernameField: "email",
      passwordField : 'password',
      passReqToCallback : true 
    }, (req,email, password, done) => {
      // Find user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, req.flash('loginMessage', 'Email er ikke registreret'));
        }
        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, req.flash('loginMessage', 'Password er forkert'));
          }
        });
      });
    })
  );
  passport.serializeUser(function(user, done) {
    // console.log(user);
    
    // console.log(user._id) //undefined med req.login
    
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
