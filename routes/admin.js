const express = require("express");
const router = express.Router();
const passport = require("passport");
const flash = require('express-flash');
const adminController = require('../controller/admin');
//admin er vores admin startside
router.get("/admin", adminController.checkAuthenticated, (req, res) => {
    res.render("admin",{authenticated:req.isAuthenticated()});
});
router.get("/admin", adminController.checkNotAuthenticated, (req, res) => {
    res.redirect("/loginadmin");
});
//Loginadmin
router.get("/loginadmin", adminController.checkNotAuthenticated, (req, res) => {
    res.render("loginadmin", {message: req.flash('loginMessage'),authenticated:req.isAuthenticated()});
});
router.get("/loginadmin", adminController.checkAuthenticated, (req, res) => {
    res.redirect("/admin");
});
router.post("/loginadmin",adminController.checkNotAuthenticated,passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/loginadmin",
    failureFlash: true
    })
);
//register course
router.get("/registercourse",adminController.checkAuthenticated, (req, res) => {
    res.render("registercourse", {authenticated:req.isAuthenticated()});
});
router.post('/registercourse',adminController.checkAuthenticated,adminController.registerCoursePost);
//get courses
router.get("/courses", adminController.checkAuthenticated,adminController.coursesGet);
// Load update Form
router.get("/course/:id",adminController.checkAuthenticated, adminController.updateFormGet);
// Update POST Route
router.post('/course/:id',adminController.checkAuthenticated,adminController.updateFormPost);
// get students in coursestudentsCourse
router.get('/studentsCourse/:id',adminController.checkAuthenticated,adminController.getstudentsCourse);
// add student in coure
router.post('/addstudentsCourse',adminController.checkAuthenticated,adminController.addstudentsCourse);
// remove student in coure
router.post('/removestudentsCourse',adminController.checkAuthenticated,adminController.removestudentsCourse);
// get students in lesson
router.get('/studentsLesson/:id',adminController.checkAuthenticated,adminController.getstudentsLesson);
// add student in lesson
router.post('/addstudentsLesson',adminController.checkAuthenticated,adminController.addstudentsLesson);
// remove student in lesson
router.post('/removestudentsLesson',adminController.checkAuthenticated,adminController.removestudentsLesson);
// Delete course
router.post('/delete/:id',adminController.checkAuthenticated, adminController.deleteCourse);

module.exports = router;