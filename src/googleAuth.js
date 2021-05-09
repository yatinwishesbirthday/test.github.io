var GoogleStrategy = require("passport-google-oauth20");
const User = require("./Model/user");

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID : process.env.CLIENT_ID,
        clientSecret : process.env.CLIENT_SECRET,
        callbackURL : process.env.CALLBACK,
        // remember to change this when you deploy this site
    }, (accessToken, refreshToken, profile, done) => {
        // logging user email
        // console.log(profile.emails[0].value);
        // find if a user exists with this email or not
        User.findOne({ email : profile.emails[0].value }).then((data) => {
            if(data){
                // user exists
                // update data
                // I am skipping the update part for now
                //Not neede in this project.
                return done(null, data);
            }else{
                // create a user
                User({
                    email : profile.emails[0].value,
                    googleId : profile.id,
                    password : null,
                    provider : 'google',
                    isVerified : true,
                }).save(function (err, data) {
                    if(err)console.log(err);
                    return done(null, data);
                })
            }
        });
    }
    ))
    
    // serializeUser and deserializeUser
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

} 