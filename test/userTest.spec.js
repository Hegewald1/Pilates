const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const app = require('../app');
const request = require('supertest');
const authenticatedUser = request.agent(app);
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
chai.use(chaiHttp);
// run commad for testen:
// mocha 'test/userTest.spec.js' --timeout 5000000
describe('Test af brugerfunktioner, som bruger', () => {
    //SetUp
    let userID;
    let userCredentials;
    let cookie;
    before(done => {
        //Oprettelse af test bruger
        let userPass='user';
        let hashedPass;
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(userPass, salt, (err, hash) => {
                hashedPass=hash;
                //Oprettelse af test user
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
            authenticatedUser.get('/user')
            .set('Cookie', cookie)
            .end((err,res)=>{
                res.header.location.should.include('/login');
                User.findById({_id:userID})
                .then((result)=>{
                    User.findOneAndDelete({_id:userID})
                    .then(()=>{
                        done();
                    });
                });
            });
        });
    });
    //Test af adgang til usersite
    it('Adgang til usersite', (done) => {
        //Arrange
        //Act
        authenticatedUser.get('/user')
        .set('Cookie', cookie)
        .end((err,res)=>{
            //Assert
            res.should.have.status(200);
            done();
        });
    });
    //Opret bruger
    it('Opret bruger', (done) => {
        //Arrange
        const newUser = {
            email: 'ny@ny.com',
            password: 'ny',
            password2: 'ny',
            name: "Ny",
            phone: "12345678",
            level: "1",
        };
        //Act
        chai.request(app)
        .post('/register')
        .send(newUser)
        .end ((err, res) =>{
            //Assert
            res.should.have.status(200);
            User.findOne().sort({field: 'asc', _id:-1}).limit(1)
            .then((result)=>{
                User.findOne({_id:result._id})
                .then(lastAddedUser =>{
                    newUser.email.should.be.equal(lastAddedUser.email);
                    newUser.name.should.be.equal(lastAddedUser.name);
                    newUser.phone.should.be.equal(lastAddedUser.phone);
                    newUser.level.should.be.equal(lastAddedUser.level);
                    // Ekstra Teardown
                    User.findByIdAndDelete({_id:lastAddedUser._id})
                    .then(()=>{
                        done();
                    });
                });
            });
        });
    }); 
    // Testskabelon
    it('Testskabelon', (done) => {
        console.log('Mangler');
        //Arrange
        //Act
        //Assert
        done();
    });
});