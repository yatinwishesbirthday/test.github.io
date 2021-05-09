const User = require("./Model/user");
const bcrypt = require("bcryptjs");
const localStrategy = require("passport-local").Strategy;

module.exports = function(passport){
    passport.use(new localStrategy({usernameField:'email'},(email,password,done)=>{
        User.findOne({ email: email }, function (err, user) {
            if (err) throw err;
            if (!user) {
              return done(null, false, { message: 'Incorrect username!' });
            }
            bcrypt.compare(password,user.password,(err,match)=>{
                if (!match) {
                    return done(null, false, { message: 'Incorrect password!' });
                  }
                if(match){
                    return done(null,user);
                }
            });
        
          });
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });
}