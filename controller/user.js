const bcrypt = require("bcryptjs");
const passport = require("passport");
const mongoose = require("mongoose");
const User = require('../models/user');
const flash = require('express-flash');
let axios=require('axios');


exports.logOut = function (req,res){
    req.logOut();
    res.redirect("/forside");
};
exports.register = function (req,res){
    //Gets data from form
    const email = req.body.email;
    const name = req.body.name;
    const phone = req.body.phone;
    const password = req.body.password;
    //Validate data
    req.checkBody('email', 'Email er påkravet').notEmpty();
    req.checkBody('email', 'Email er ikke valid').isEmail();
    req.checkBody('name', 'Navn er påkravet').notEmpty();
    req.checkBody('phone', 'Telefonnr er påkravet').notEmpty();
    req.checkBody('phone', 'Telefonnr skal have en længde på 8').isLength({ min: 8, max:8 });
    req.checkBody('phone', 'Telefonnr er ikke valid').matches(/[0-9]{8}/);
    req.checkBody('password', 'Password er påkravet').notEmpty();
    req.checkBody('password2', 'Passwords er ikke ens').equals(password);
    let errorsFromVal = req.validationErrors();
    //Validation erros array
    let errors=[];
    for (let i = 0; i< errorsFromVal.length; i++) {
        errors.push({param: errorsFromVal[i].param , msg:errorsFromVal[i].msg,value:errorsFromVal[i].value });
    }
    //Check email dosent allready exist in DB
    let emailDuplicate = false;
    User.findOne({
        email: email
    },(err,data)=> {
        if (data!=null) {
            emailDuplicate = true;
        }
    })
    .then((err,data)=> {
        //If found push error to errors
        if (emailDuplicate) {
            errors.push({param: 'email' , msg:'Emailen er allerede registreret i vores system',value:email });
        }
        //Checks if there is any errors if errors the send errors to site
        if(errors.length>0){
            res.render('register', {errors:errors},{authenticated:req.isAuthenticated()}); 
        } else {
        //If no errors then  the password is hashed
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) throw err;
                    //Create new User
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: email,
                        password: hash,
                        name: name,
                        phone: phone,
                        level: '1',
                        admin: false
                    });
                    //Save user in DB
                    user
                    .save()
                    .then(result => {
                        res.redirect('/welcome');
                    })
                    .catch(err => {
                        console.log(err);
                    res.render('register',{ message: req.flash(err),authenticated:req.isAuthenticated() } );
                    });
                });
            });
        }
    });
};

exports.checkAuthenticated= function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};
exports.checkNotAuthenticated = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect("/user");
};



