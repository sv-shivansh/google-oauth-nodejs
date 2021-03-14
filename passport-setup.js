const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const oauth = require('./model')
require('dotenv').config()

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  oauth.findById(id).then((user)=>{
    done(null,user)
  })
});
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async function (accessToken, refreshToken, profile, done) {
      let user = await oauth.findOne({googleId: profile.id})
      if(user){
        done(null,user)
      }
      else{
        user = new oauth({
          name : profile.displayName,
          email: profile.emails[0].value
        })
        await user.save();
        done(null,user)
      }
    }
  )
);
