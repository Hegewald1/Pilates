const express = require("express");
const router = express.Router();
const passport = require("passport");
const flash = require('express-flash');
const userController = require('../controller/user');
const User = require ('../models/user');
//TODO:
//tilmeld/afmeld route
router.get("/tilmeldAfmeld",userController.checkAuthenticated, (req, res) => {
    res.render("tilmeldAfmeld", {'authenticated':req.isAuthenticated()});
});
//user er vore bruger start side
router.get("/user", userController.checkAuthenticated, (req, res) => {
  res.render("user", {authenticated:req.isAuthenticated()});
});
router.get("/user", userController.checkNotAuthenticated, (req, res) => {
  res.redirect("/login");  
});
//Login
router.get("/login", userController.checkNotAuthenticated, (req, res) => {
  res.render("login", {message: req.flash('loginMessage'),authenticated:req.isAuthenticated()});
  

});
router.get("/login", userController.checkAuthenticated, (req, res) => {  
    res.redirect("/user");
});
router.post("/login",userController.checkNotAuthenticated,passport.authenticate("local", {
    successRedirect: "/user",
    failureRedirect: "/login",
    failureFlash: true,
    
  })
);
//Logout
router.get("/logout", userController.logOut);
//register user
router.get("/register", userController.checkNotAuthenticated, (req, res) => { 
  res.render("register",{authenticated:req.isAuthenticated()});
});
router.get("/register", userController.checkAuthenticated, (req, res) => {
  res.redirect("/user"); 
});
router.post('/register', userController.checkNotAuthenticated,userController.register);




//Welcome -- Skal blive logget ind når man har registreret sig!!
router.get('/welcome', userController.checkAuthenticated,(req,res) => {
 
  let userID = req.session.passport.user;
  
  let currentUser = User.findOne({_id : userID}).exec().then(result => {
    res.render("welcome", {authenticated:req.isAuthenticated(), name : result.name});
  });
  
  
  
  
  
  // res.render("welcome", {authenticated:req.isAuthenticated(), name : name});


  //TODO: forstår ikke helt loggiken i det nedenunder
  // if(req.isAuthenticated()) {
  //     res.render("welcome", {'authenticated':true});
  // }
  
  // if(!req.isAuthenticated()) {
  //     res.redirect("/forside");
  // }
});



//Update
//TODO: mangler...
//Delete
//TODO: mangler...



module.exports = router;

