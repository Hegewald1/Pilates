//INITIALISERING
const express = require("express");
const app = express();
const session = require("express-session");
const dbConfig = require("./config/database");
const mongoose = require("mongoose");
const passport = require("passport");
const initializePassport = require("./config/passport");
const flash = require("express-flash");
const methodOverride = require("method-override");
const expressValidator = require('express-validator');


//STATIC FOLDER
app.use(express.static("public"));
app.use(express.static("js"));
//MIDDLEWARE
// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.'),
      root    = namespace.shift(),
      formParam = root;
    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
//Flash middleware
app.use(flash());
//Session middleware
const secret = require("crypto")
  .randomBytes(48)
  .toString("hex");
//TODO:maxage er 10 sek tænker vi sætter den til en time senere men for test er 10 sek fint lige nu
app.use(
  session({
    secret: secret,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
  })
);
//passport middleware
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());
//method override middleware
app.use(methodOverride("_method"));
//Ved ikke hvad jeg skal skrive her
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/", require("./routes/tabs"));
app.use("/", require("./routes/user"));
app.use("/", require("./routes/admin"));
// Load View Engine
app.set("view engine", "pug");
//mongdb setup
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.database, {
  useNewUrlParser: true,
  useCreateIndex: true,
  autoIndex: false,
  useUnifiedTopology: true,
  useFindAndModify: false
});
let db = mongoose.connection;
// Check connection
db.once("open", function() {
  console.log("Connected to MongoDB");
});
// Check for DB errors
db.on("error", function(err) {
  console.log(err);
});
// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Listening on port: " + PORT));

module.exports = app;