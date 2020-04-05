const mongoose = require("mongoose");
const ObjectID = require('mongodb').ObjectID;
const bcrypt = require("bcryptjs");
const Course = require("../models/course");
const Lesson = require('../models/lesson');
const User = require("../models/user");
const app = require('../app');
const request = require('supertest');
const authenticatedUser = request.agent(app);
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
chai.use(chaiHttp);

//https://mherman.org/blog/testing-node-js-with-mocha-and-chai/
//ekstra links til auth
//https://medium.com/@juha.a.hytonen/testing-authenticated-requests-with-supertest-325ccf47c2bb
// https://codeburst.io/authenticated-testing-with-mocha-and-chai-7277c47020b7
// mocha 'test/adminTest.js' --timeout 5000000
//Test af hold
describe('Test af adminfunktioner, som admin', () => {
    //SetUp
    let testCourseId;
    let testLessonId;
    let date = new Date('2019-12-01T03:24:00');
    let adminID;
    let adminCredentials;
    let cookie;
    before(done => {
        //oprettelse af test leksion
        let lesson = new Lesson({
            _id: new mongoose.Types.ObjectId(),
            lessonName: 'test',
            level: 'test',
            seats: 2,
            date: date,
            place: 'test'
        });
        let lessons=[lesson._id];
        testLessonId=lesson._id;
        //Oprettelse af test hold
        const course = new Course({
            _id: new mongoose.Types.ObjectId(),
            courseName: 'test',
            level: 'test',
            seats: 2,
            date: date,
            place: 'test',
            lessons: lessons
        });
        testCourseId=course._id;
        let adminPass='admin';
        let hashedPass;
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(adminPass, salt, (err, hash) => {
                // if (err) throw err;
                hashedPass=hash;
                //Oprettelse af test admin
                const admin = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: 'admin@admin.com',
                            password: hashedPass,
                            name: "Admin",
                            phone: "12345678",
                            level: "1",
                            admin: true
                });
                adminID=admin._id;
                adminCredentials = {
                    email: admin.email,
                    password: adminPass,
                };
                lesson.save().then(result =>{
                    course.save().then(()=>{
                        admin.save().then(()=>{
                            //Admin login
                            authenticatedUser
                            .post('/loginadmin')
                            .send(adminCredentials)
                            .end(function(err, response){
                                response.header.location.should.include('/admin');
                                cookie=cookie = response
                                .headers['set-cookie'][0]
                                .split(',')
                                .map(item => item.split(';')[0])
                                .join(';');
                                done(); 
                            });
                        });
                    });
                });
            });
        });
    });
    //TearDown
    after(done => {
        authenticatedUser
        .get('/logout')
        .then(()=>{
            Lesson.findOneAndDelete({_id:testLessonId})
            .then(()=>{
                Course.findOneAndDelete({_id:testCourseId})
                .then(()=>{
                    User.findOneAndDelete({_id:adminID})
                    .then(()=>{
                        done();
                    });
                });
            });
        });
    });
    //Test af adgang til adminsite
    it('Adgang til adminsite', (done) => {
        //Arrange
        //Act
        authenticatedUser.get('/admin')
        .set('Cookie', cookie)
        .end((err,res)=>{
            //Assert
            res.should.have.status(200);
            done();
        });
    });
    //Test af oprettelse af hold
    it('Oprettelse af hold', (done) => {
        //Arrange
        const testcourse={
            courseName: 'test2',
            level: 'test2',
            seats: 8,
            date: date,
            place: 'test'
        };
        //Act
        authenticatedUser
        .post('/registercourse')
        .set('Cookie', cookie)
        .send(testcourse)
        .end ((err, res) =>{
            //Assert
            res.header.location.should.include('/courses');
            Course.findOne().sort({field: 'asc', _id:-1}).limit(1)
            .then((newCourse)=>{
                testcourse.courseName.should.be.eql(newCourse.courseName);
                testcourse.level.should.be.eql(newCourse.level);
                testcourse.seats.should.be.eql(newCourse.seats);
                testcourse.date.should.be.eql(newCourse.date);
                testcourse.place.should.be.eql(newCourse.place);
                should.exist(newCourse);
                // Ekstra Teardown
                newCourse.lessons.forEach(lesson => {
                    Lesson.findByIdAndDelete({_id:lesson}).then();
                });
                Course.findByIdAndDelete({_id:newCourse._id})
                .then(()=>{
                    done();
                });
            });
        });
    });
    // test af vis hold
    it('Vis hold', (done) => {
        //Arrange
        //Act
        authenticatedUser
        .get('/courses')
        .set('Cookie', cookie)
        .end ((err, res) =>{
            //Assert
            res.text.should.include(testCourseId);
            res.should.have.status(200);
            done();
        });
    });
    // Test af update hold
    it('Update hold', (done) => {
        //Arrange
        let newDate=new Date('2019-11-01T03:24:00');
        let lessonsID=[ObjectID(testLessonId)];
        const newCourse = {
            courseName: 'test1',
            level: 'test1',
            seats: 1,
            date: '2019-11-01T03:24:00',
            place: 'test1',
            lessonId:lessonsID,
            lessonPlace: ['test1'],
            lessonDate:[newDate]
        };
        //Act
        authenticatedUser
        .get('/course/'+testCourseId)
        .set('Cookie', cookie)
        .end ((err, res) =>{
            //Assert
            res.should.have.status(200);
            authenticatedUser
            .post('/course/'+testCourseId)
            .set('Cookie', cookie)
            .send(newCourse)
            .end ((err, res) =>{
                res.header.location.should.include('/courses');
                Course.findOne({_id:testCourseId})
                .then(result=>{
                    result.courseName.should.be.eql(newCourse.courseName);
                    result.level.should.be.eql(newCourse.level);
                    result.seats.should.be.eql(newCourse.seats);
                    result.date.should.be.eql(newDate);
                    result.place.should.be.eql(newCourse.place);
                    Lesson.findById({_id:newCourse.lessonId[0]})
                    .then((res)=>{
                        res.place.should.be.eql(newCourse.lessonPlace[0]);
                        res.date.should.be.eql(newCourse.lessonDate[0]);
                        res.seats.should.be.eql(newCourse.seats);
                        done();
                    });
                });
            });
        });
    });
    // Test af tilføj bruger til hold
    it('Tilføj bruger til hold', (done) => {
        //Arrange
        const user1 = new User({
            _id: new mongoose.Types.ObjectId(),
            email: 'user1@user1.com',
            password: '123',
            name: "User1",
            phone: "12345678",
            level: "1",
            admin: false
        });
        const user2 = new User({
            _id: new mongoose.Types.ObjectId(),
            email: 'user2@user2.com',
            password: '123',
            name: "User1",
            phone: "12345678",
            level: "1",
            admin: false
        });
        user1
        .save()
        .then(()=>{
            user2
            .save()
            .then(()=>{
                let addUser1Info ={
                    user:user1._id,
                    course:testCourseId
                };
                let addUser2Info ={
                    user:user2._id,
                    course:testCourseId
                };
                //Act
                //User 1 add to course max Seats is 1 should add
                authenticatedUser
                .post('/addstudentsCourse')
                .set('Cookie', cookie)
                .send(addUser1Info)
                .end ((err, res) =>{
                    //User 2 add to course max Seats is 1 should not add
                    authenticatedUser
                    .post('/addstudentsCourse')
                    .set('Cookie', cookie)
                    .send(addUser2Info)
                    .end ((err, res) =>{
                        //assert
                        Course.findOne({_id:testCourseId})
                        .then((courseresult)=>{
                            courseresult.users[0].should.be.eql(user1._id);
                            should.not.exist(courseresult.users[1]);
                            Lesson.findOne({_id:testLessonId})
                            .then((lessonresult)=>{
                                lessonresult.users[0].should.be.eql(user1._id);
                                should.not.exist(lessonresult.users[1]);
                                // Ekstra Teardown
                                Course.findOneAndUpdate({_id:testCourseId},{$pull:{users:user1._id}})
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
                                            Lesson.findOneAndUpdate({_id:les._id},{$pull:{users:user1.id}}).then();
                                        });
                                        User.findByIdAndDelete({_id:user1._id})
                                        .then(()=>{
                                            User.findByIdAndDelete({_id:user2._id})
                                            .then(()=>{
                                                done();
                                            });
                                        });
                                    });
                                });                                
                            });
                        });
                    });
                });
            });
        });
    });
    // Test af fjern bruger fra hold
    it('Fjern bruger fra hold', (done) => {
        //Arrange
        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            email: 'user@user.com',
            password: '123',
            name: "User1",
            phone: "12345678",
            level: "1",
            admin: false
        });
        let removeUserInfo ={
            user:user._id,
            course:testCourseId
        };
        user
        .save()
        .then(()=>{
            Course.findOneAndUpdate({_id:testCourseId},{$push:{users:user._id}})
            .then(()=>{
                //act
                authenticatedUser
                .post('/removestudentsCourse')
                .set('Cookie', cookie)
                .send(removeUserInfo)
                .end ((err, res) =>{
                    Course.findOne({_id:testCourseId})
                    .then((courseresult)=>{
                        //assert
                        should.not.exist(courseresult.users[0]);
                        Lesson.findOne({_id:testLessonId})
                        .then((lessonresult)=>{
                            should.not.exist(lessonresult.users[0]);
                            // Ekstra Teardown
                            User.findByIdAndDelete({_id:user._id})
                            .then(()=>{
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
    // Test af sletning af hold
    it('Sletning af hold', (done) => {
        //Arrange
        let lesson = new Lesson({
            _id: new mongoose.Types.ObjectId(),
            lessonName: 'test',
            level: 'test',
            seats: 2,
            date: date,
            place: 'test'
        });
        let lessons=[ObjectID(lesson._id)];
        const course = new Course({
            _id: new mongoose.Types.ObjectId(),
            courseName: 'test',
            level: 'test',
            seats: 2,
            date: date,
            place: 'test',
            lessons: lessons
        });
        course
        .save()
        .then(()=>{
            lesson
            .save()
            .then(()=>{
                //Act
                authenticatedUser
                .post('/delete/'+course._id)
                .set('Cookie', cookie)
                .end ((err, res) =>{
                    //Assert         
                    res.header.location.should.include('/courses');              
                    Course.findOne({_id:course._id})
                    .then(newCourse =>{
                        should.not.exist(newCourse);
                        Lesson.findOne({_id:course.lessons[0]})
                        .then((newLesson) =>{
                            should.not.exist(newLesson);
                            done();
                        });
                    });
                });
            });
        });
    });
    // Test af tilføj bruger til leksion
    it('Tilføj bruger til leksion', (done) => {
        //Arrange
        const user1 = new User({
            _id: new mongoose.Types.ObjectId(),
            email: 'user1@user1.com',
            password: '123',
            name: "User1",
            phone: "12345678",
            level: "1",
            admin: false
        });
        const user2 = new User({
            _id: new mongoose.Types.ObjectId(),
            email: 'user2@user2.com',
            password: '123',
            name: "User1",
            phone: "12345678",
            level: "1",
            admin: false
        });
        user1
        .save()
        .then(()=>{
            user2
            .save()
            .then(()=>{
                let addUser1Info ={
                    user:user1._id,
                    lesson:testLessonId
                };
                let addUser2Info ={
                    user:user2._id,
                    lesson:testLessonId
                };
                //Act
                //User 1 add to lesson max Seats is 1 should add
                authenticatedUser
                .post('/addstudentsLesson')
                .set('Cookie', cookie)
                .send(addUser1Info)
                .end ((err, res) =>{
                    //User 2 add to lesson max Seats is 1 should not add
                    authenticatedUser
                    .post('/addstudentsLesson')
                    .set('Cookie', cookie)
                    .send(addUser2Info)
                    .end ((err, res) =>{
                        //assert
                        Lesson.findOne({_id:testLessonId})
                        .then((lessonresult)=>{
                            lessonresult.users[0].should.be.eql(user1._id);
                            should.not.exist(lessonresult.users[1]);
                            // Ekstra Teardown
                            Lesson.findOneAndUpdate({_id:testLessonId},{$pull:{users:user1._id}})
                            .then(()=>{
                                User.findByIdAndDelete({_id:user1._id})
                                .then(()=>{
                                    User.findByIdAndDelete({_id:user2._id})
                                    .then(()=>{
                                        done();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
    // Test af fjern bruger fra leksion
    it('Fjern bruger fra leksion', (done) => {
         //Arrange
        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            email: 'user@user.com',
            password: '123',
            name: "User1",
            phone: "12345678",
            level: "1",
            admin: false
        });
        let removeUserInfo ={
            user:user._id,
            lesson:testLessonId
        };
        user
        .save()
        .then(()=>{
            Lesson.findOneAndUpdate({_id:testLessonId},{$push:{users:user._id}})
            .then(()=>{
                //act
                authenticatedUser
                .post('/removestudentsLesson')
                .set('Cookie', cookie)
                .send(removeUserInfo)
                .end ((err, res) =>{
                    Lesson.findOne({_id:testLessonId})
                    .then((lessonresult)=>{
                        //assert
                        should.not.exist(lessonresult.users[0]);
                        // Ekstra Teardown
                        User.findByIdAndDelete({_id:user._id})
                        .then(()=>{
                            done();
                        });
                    });
                });
            });
        });
    });

});

describe('Test af admin adgang, som normal bruger og uden login', () => {
    //SetUp
    let userID;
    let userCredentials;
    let cookie;
    before(done => {
        let userPass='user';
        let hashedPass;
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(userPass, salt, (err, hash) => {
                // if (err) throw err;
                hashedPass=hash;
                //Oprettelse af test bruger
                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    email: 'user@user.com',
                    password: hashedPass,
                    name: "User",
                    phone: "12345678",
                    level: "1",
                    admin: false
                });
                userID=user._id;
                userCredentials = {
                    email: user.email,
                    password: userPass,
                };
                user.save().then(()=>{
                    //User login
                    authenticatedUser
                    .post('/login')
                    .send(userCredentials)
                    .end(function(err, response){
                        response.header.location.should.include('/user');
                        cookie=cookie = response
                        .headers['set-cookie'][0]
                        .split(',')
                        .map(item => item.split(';')[0])
                        .join(';');
                        done(); 
                    });
                });
            });
        });
    });
    //TearDown
    after(done => {
        authenticatedUser
        .get('/logout')
        .then(()=>{
            User.findById({_id:userID})
            .then((result)=>{
                // console.log(result);
                User.findOneAndDelete({_id:userID})
                .then(()=>{
                    done();
                });
            });
        });
    });
    it('Adgang til adminsite', (done) => {
        //Arrange
        //Act
        authenticatedUser.get('/admin')
        .set('Cookie', cookie)
        .end((err,res)=>{
            //Assert
            res.header.location.should.include('/loginadmin');   
            authenticatedUser.get('/admin')
            .end((err,res)=>{
                res.header.location.should.include('/loginadmin');   
                done();
            });
        });
    });
});