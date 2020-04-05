const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const mongoose = require("mongoose");
const User = require('../models/user');
// const Team = require("../models/team");
const flash = require('express-flash');
const ObjectID = require('mongodb').ObjectID;
//TEST OPRETTELSE AF HOLD MED 1 BRUGER
// exports.testholdmedenbruger = function() {
//     const team = new Team({
//         _id: new mongoose.Types.ObjectId(),
//         teamName: "Profferne med users",
//         level: "Meget øvet",
//         seats: 8,
//         time: "Tirsdag kl 14.00",
//         place: "Mejlgade",
//         users: []
//     });
//     bcrypt.genSalt(10, (err, salt) => {
//         bcrypt.hash('123', salt, (err, hash) => {
//             if (err) throw err;
//                 const user = new User({
//                     _id: new mongoose.Types.ObjectId(),
//                     email: 'email12@email.com',
//                     password: hash,
//                     name: "Random Name",
//                     phone: "12345678",
//                     level: "1",
//                     admin: false
//                 });
//         });
//     });
//     user
//     .save()
//     .then(result => {
        
//     });
//     team.users.push(user);
//     team
//     .save()
//     .then(result => {
//         console.log(result);
//     })
//     .catch(err => {
//         console.log(err);
//     });
// };
// exports.testhold = function() {
//     const team = new Team({
//         _id: new mongoose.Types.ObjectId(),
//         teamName: "Profferne med users",
//         level: "Meget øvet",
//         seats: 8,
//         time: "Tirsdag kl 14.00",
//         place: "Mejlgade",
//         users: []
//     });
//     team
//     .save()
//     .then(result => {
//         console.log(result);
//     })
//     .catch(err => {
//         console.log(err);
//     });
// };
exports.testbruger=function () {
    bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash('123', salt, (err, hash) => {
        if (err) throw err;
        const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: 'email@email.com',
        password: hash,
        name: "Random Name",
        phone: "12345678",
        level: "1",
        admin: false
        });
        user
        .save()
            .then(result => {
                console.log(result);
        })
        .catch(err => {
            console.log(err);
        });
    });
    });
};     
exports.testadmin=function () {
    bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash('123', salt, (err, hash) => {
        if (err) throw err;
        const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: 'a@a.com',
        password: hash,
        name: "Random Name",
        phone: "12345678",
        level: "1",
        admin: true
    });
    user
        .save()
            .then(result => {
                console.log(result);
        })
        .catch(err => {
            console.log(err);
        });
    });
    });
};