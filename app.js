//By : Shivakumar N
//@: april-1st-2019
var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var chalk = require('chalk');
var logger = require('morgan');
var passport = require('passport');
var path = require('path');

//mongoDb configuration setup
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/school", { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
mongoose.connection.on('error', (err, success) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

//End Point Classes import 
var AuthController = require('./src/controller/AuthController');
var UserController = require('./src/controller/UserController');
var StudentController = require('./src/controller/StudentController');
var S3UploadController = require('./src/controller/S3UploadController');

// express app configuration
var app = express();
app.set('views');
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

/* app.get('/', function (req, res) {
res.send('Hello World')
}) */

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//End Point maping with router 
app.use('/', AuthController);
app.use('/users', UserController);
app.use('/students', StudentController);
app.use('/ws', S3UploadController);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
