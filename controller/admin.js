const bcrypt = require("bcryptjs");
const passport = require("passport");
const mongoose = require("mongoose");
const User = require('../models/user');
const Course = require("../models/course");
const Lesson = require('../models/lesson');
const flash = require('express-flash');
const ObjectID = require('mongodb').ObjectID;

exports.registerCoursePost = function (req,res){
    //Gets data from form
    const courseName = req.body.courseName;
    const level = req.body.level;
    const seats = req.body.seats;
    const place = req.body.place;
    const date = new Date(req.body.date);
    
    //Validate data ved ikke om vi skal det lige nu
    req.checkBody('courseName', 'Navn er påkravet').notEmpty();
    req.checkBody('level', 'Niveau er påkravet').notEmpty();
    req.checkBody('seats', 'Antal pladser er påkravet').notEmpty();
    req.checkBody('place', 'Lokale er påkravet').notEmpty();
    req.checkBody('date', 'Dato er påkravet').notEmpty();
    //TODO: er der flere ting vi skal tjekke for lige nu? Nej, et hold indeholder ikke mere end dette. 
    //Altså på Time kunne vi jo tjekke for tid også i stedet for kun dato
    //ja men jeg tænker lidt vi måske bare lad det her stå ind til vi får tid sat ordentlig op
    //i schemaet. Det er så fint. Det gør vi bare, vi holder det simpelt. jep. Btw, lad alt det her udkommenteret txt stå :P
    //selvfølgelig. Moist
    let errors = req.validationErrors();
    //Checks if there is any errors if errors the send errors to site
    if(errors.length>0){
        res.render('registercourse', {errors:errors,authenticated:req.isAuthenticated()}); 
    }
    //Create lessons
    let lessonSize = 8;
    let lessons = [];
    for (let i = 1; i <= lessonSize; i++) {
        let lessonName=courseName + ' ' + i;
        let lesson = new Lesson({
            _id: new mongoose.Types.ObjectId(),
            lessonName: lessonName,
            level: level,
            seats: seats,
            date: new Date().setDate(date.getDate() + (7*(i-1))),
            place: place,
        });
        lessons.push(lesson);
        lesson.save();
    }
    //Create new course
    const course = new Course({
        _id: new mongoose.Types.ObjectId(),
        courseName: courseName,
        level: level,
        seats: seats,
        date: date,
        place: place,
        lessons: lessons
    });
    //Save course in DB
    course
    .save()
    .then(result => {
        // console.log(result);
    })
    .catch(err => {
        console.log(err);
        res.render('registercourse',{ message: req.flash(err),authenticated:req.isAuthenticated() } );
    });
    //redirect to teams site
    res.redirect('/courses');
};
exports.coursesGet = function (req,res){
    let courses=[];
    Course.find({},function(err,res){
        courses=res;
    }).then((err,data)=> {
    res.render("courses",{courses:courses,authenticated:req.isAuthenticated()});
    });
};
exports.updateFormGet = function (req,res){ 
    Course.findById(req.params.id) 
    .then((course) => { 
        Lesson.find({ 
            _id: { $in: course.lessons} 
        }) 
        .then((lessons) =>{ 
            res.render('course',{course:course,lessons:lessons,authenticated:req.isAuthenticated()}); 
        }); 
    }); 
};
exports.updateFormPost = function (req,res){
    //Gets data from form
    let lessons=req.body.lessonId;
    let lessonsPlace=req.body.lessonPlace;
    let lessonDate=req.body.lessonDate;
    for (let index = 0; index < lessons.length; index++) {
        Lesson.findOneAndUpdate({_id:lessons[index]},{place:lessonsPlace[index],date:lessonDate[index],seats:req.body.seats}).then();
    }
    let course ={};
    course.courseName = req.body.courseName;
    course.level = req.body.level;
    course.seats = req.body.seats;
    course.place = req.body.place;
    course.date = new Date(req.body.date);

    Course.updateOne({_id:req.params.id}, course)
    .then(()=>{
        res.redirect('/courses');
    });
};

exports.getstudentsCourse = function (req,res){
    let courseID=req.params.id;
    Course.findById(courseID) 
    .then((course) => { 
        User.find({ 
            _id: { $in: course.users} 
        })
        .then((usersOnCourse) => {
            User.find({ 
                _id: { $nin: usersOnCourse} 
            })
            .then((usersNotOnCourse) => {
                res.render('studentsCourse',
                {usersOnCourse:usersOnCourse,usersNotOnCourse:usersNotOnCourse,courseID:courseID,authenticated:req.isAuthenticated()});
            });
        });
    }); 
};
exports.addstudentsCourse = function (req,res,next){
    Course.findOne({_id:req.body.course})
    .then((course)=>{
        if (course.users.length<course.seats) {
            User.findOne({_id:req.body.user})
            .then((user) =>{
                Course.findOneAndUpdate({_id:req.body.course},{$push:{users:user.id}})
                .then((course)=>{
                    Lesson.find({ 
                        _id: { $in: course.lessons} 
                    }) 
                    .then((lessons) =>{ 
                        let lessonsToBeUpdated=[];
                        lessons.forEach((lesson)=>{
                            lessonsToBeUpdated.push(lesson);
                        });
                        lessonsToBeUpdated.forEach((les)=>{
                            Lesson.findOneAndUpdate({_id:les._id},{$push:{users:user.id}}).then((res)=>{
                            });
                        });
                        next();
                    });
                });
            });
        } else {
            next();
        }
    });
};
exports.removestudentsCourse = function (req,res,next){
    User.findOne({_id:req.body.user})
    .then((user) =>{
        Course.findOneAndUpdate({_id:req.body.course},{$pull:{users:user._id}})
        .then((course)=>{
            Lesson.find({ 
                _id: { $in: course.lessons} 
            }) 
            .then((lessons) =>{ 
                let lessonsToBeUpdated=[];
                lessons.forEach((lesson)=>{
                    lessonsToBeUpdated.push(lesson);
                });
                lessonsToBeUpdated.forEach((les)=>{
                    Lesson.findOneAndUpdate({_id:les._id},{$pull:{users:user.id}})
                    .then((res)=>{
                    next();
                    });
                });
            });
        });
    });
};
exports.getstudentsLesson = function (req,res){
    let lessonID=req.params.id;
    Lesson.findById(lessonID) 
    .then((lesson) => { 
        User.find({ 
            _id: { $in: lesson.users} 
        }).then((usersOnLesson) => {
            User.find({ 
            _id: { $nin: usersOnLesson} })
            .then((usersNotOnLesson) => {
                Course.findOne({lessons:{$in:[lessonID]}})
                .then((course)=>{
                    let courseID=course._id;
                    res.render('studentsLesson',
                    {usersOnLesson:usersOnLesson,usersNotOnLesson:usersNotOnLesson,
                    lessonID:lessonID,courseID:courseID,authenticated:req.isAuthenticated()});                
                });
            });
        });
    }); 
};
exports.addstudentsLesson = function (req,res,next){
    Lesson.findOne({_id:req.body.lesson})
    .then((lesson)=>{
        if (lesson.users.length<lesson.seats) {
            User.findOne({_id:req.body.user})
            .then((user) =>{
                Lesson.findOneAndUpdate({_id:req.body.lesson},{$push:{users:user._id}})
                .then(()=>{
                    next();
                });
            });
        } else {
            next();
        }
    });
};
exports.removestudentsLesson = function (req,res,next){
    User.findOne({_id:req.body.user})
    .then((user) =>{
        Lesson.findOneAndUpdate({_id:req.body.lesson},{$pull:{users:user._id}})
        .then(()=>{
            next();
        });
    });
};

exports.deleteCourse =function (req,res){
    Course.findOne({_id:req.params.id})
    .then((course)=>{
        course.lessons.forEach(lesson => {
            Lesson.findByIdAndDelete({_id:lesson}).then();
        });
    });
    Course.findByIdAndDelete({_id:req.params.id})
    .then(()=>{
        res.redirect('/courses');
    });
};
exports.checkAuthenticated= function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect("/loginadmin");
    } else {
        let _id = ObjectID(req.session.passport.user);
        let admin=false;
        User.findOne({
            _id: _id
        },(err,data)=> {
            if (data!=null) {
                admin=data.admin;
            }
        }).then((err,data)=> {
        if (admin) {
            next();
        } else {
            res.redirect("/loginadmin");
        }
        });
    }
};
exports.checkNotAuthenticated = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    } else {
        let _id = ObjectID(req.session.passport.user);
        let admin=false;
        User.findOne({
            _id: _id
        },(err,data)=> {
            if (data!=null) {
                admin=data.admin;
            }
        }).then((err,data)=> {
        if (admin) {
            res.redirect("/admin");
        } else {
            req.logOut();
            return next();
        }
        });
    }
};