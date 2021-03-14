const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
require('./passport-setup')
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser"); // parse cookie header
const port = 5000;
const mongoose = require('mongoose')
require('dotenv').config();

const uri = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.nf8mx.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`
const connectDB = async() =>{
    try{
        await mongoose.connect(uri,{
            useUnifiedTopology:true,
            useNewUrlParser:true,
            useFindAndModify:false
        });
        console.log('MongoDB connected')
    }
    catch(err){
        console.error(err.message);
        process.exit(1);
    }
}

connectDB();
const app = express();


app.use(
    cookieSession({
      name: "session",
      keys: ["key1", "key2"],
      maxAge: 24 * 60 * 60 * 100
    })
  );
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json({ extended: false }));
  
const authCheck = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({
      authenticated: false,
      message: "user has not been authenticated"
    });
  } else {
    next();
  }
};

app.get('/', authCheck, async(req,res) =>{
    res.json({
      authenticated: true,
      message: "authenticated",
      user: req.user
    })
})

app.get('/current', async(req,res)=>{
  res.send(req.user)
})

app.get('/logout', async(req,res)=>{
  req.logout();
  res.send('logged out')
})

app.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  
app.get(
    "/google/callback",
    passport.authenticate("google", { successRedirect:"/", failureRedirect: "/loginFailed" })
  );
  

app.listen(port, () => {
    console.log(`App is running at ${port}`);
})