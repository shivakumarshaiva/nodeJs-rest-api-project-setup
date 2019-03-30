// UserController.js
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../../config');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var User = require('../models/User');
// ADD THIS PART

// CREATES A NEW USER
router.post('/create', (req, res) => {

  var hashedPassword = bcrypt.hashSync(req.body.password, 8);

  var user = new User({
    usersName: req.body.usersName,
    userEmail: req.body.userEmail,
    password: hashedPassword,
    role: req.body.isAdmin ? ['ADMIN', 'USER'] : ['USER'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  User.findOne({ userEmail: user.userEmail}, (err, result) => {
    if (err) {
      console.error('There was a problem finding the user');
      return res.status(500).json({ 
        message:"There was a problem finding the user.",
        code: 500,
        data: null, 
      });
    } else if (result){
      console.info('User already registered by this email:', result.userEmail);
      return res.status(200).json({ 
        message: 'User already registered by this email:'+ result.userEmail,
        code: 200,
        data: null, 
      })
    } 
    User.create(user, (err, result) => {
      if (err) {
        console.error('Error in Uesr register page :', err);
        return res.status(500).json({ 
          message:"There was a problem adding the information to the database.",
          code: 500,
          data: null, 
        });
      } else {
        // check me:
        // var token = req.headers['access-token'];
        // if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

        // jwt.verify(token, config.secret, function (err, decoded) {
        //   if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        //   res.status(200).send(decoded);
        // });
        // var token = jwt.sign({ id: result._id, name: result.userName, email: result.userEmail, role: result.role }, config.secret, {
        //   expiresIn: 86400 // expires in 24 hours
        // });
        console.info('User Registered Successfully with the email:', result.userEmail);
        res.status(200).json({ 
          message: 'User Registered Successfully with the email:' + result.userEmail, 
          code: 200,
          data: result, 
        });
      }
      console.info('No Operations Performed in User');
      res.status(200).json({
        message: 'No Operations Performed',
        code: 400,
        data: null,
      });
    });
  });
});
// RETURNS ALL THE USERS IN THE DATABASE
router.get('/', function (req, res) {
  console.log('req.query :', req.query.page);
  User.paginate({}, { page: (Number)(req.query.page), limit: (Number)(req.query.limit) }, function (err, results) {
    if (err) {
      console.error('Error in users finding page :', err);
      return res.status(500).json({
        message: 'There was a problem for finding the users',
        code: 500,
        data: null,
      });
    } else if (results) {
      console.info('Users Records Fund and returned', results);
      return res.status(200).json({
        message: 'User(s) Data Fetched Successfully',
        code: 200,
        data: results,
      });
    }
    console.info('No Operations Performed in User');
    res.status(200).json({
      message: 'No Operations Performed',
      code: 400,
      data: null,
    });
  });
});

// GETS A SINGLE USER FROM THE DATABASE
router.get('/:id', function (req, res) {
  User.findById(req.params.id, function (err, findResult) {
    if (err) {
      console.error('Error in user finding page :', err);
      return res.status(500).json({
        message: 'Error in user finding',
        code: 500,
        data: null,
      });
    } else if (findResult) {
      console.info('User Fund and returned');
      return res.status(200).json({
        message: 'User Fetched Successfully',
        code: 200,
        data: findResult,
      });
    }
    console.info('No Operations Performed in User');
    res.status(200).json({
      message: 'No Operations Performed',
      code: 400,
      data: null,
    });
  });
});

// DELETES A USER FROM THE DATABASE
router.delete('/:id', function (req, res) {
  User.findByIdAndRemove(req.params.id, function (err, removeResult) {
    if (err) {
      console.error('Error in User deleting page :', err);
      return res.status(500).json({
        message: 'Error in User deleting',
        code: 500,
        data: null,
      });
    } else if (removeResult) {
      console.info('User Record Deleted and returned');
      res.status(200).json({
        message: 'User Record Deleted Successfully',
        code: 200,
        data: true,
      });
    }
    console.info('No Operations Performed in User');
    res.status(200).json({
      message: 'No Operations Performed',
      code: 400,
      data: null,
    });
  });
});

// UPDATES A SINGLE USER IN THE DATABASE
router.post('/update/:id', function (req, res) {
  User.findOne({ _id: req.params.id }, (err, findResult) => {
    if (err) {
      console.error('There was a problem for finding the user');
      return res.status(500).json({ message: "There was a problem finding the user on" });
    } else if (findResult) {

      var userRecord = {
        usersName: req.body.usersName,
        userEmail: req.body.userEmail,
        role: req.body.isAdmin ? ['ADMIN', 'USER'] : ['USER'],
        updatedAt: new Date(),
      }

      const userResult = User.findOneAndUpdate({ _id: req.params.id }, userRecord, (err, updateResult) => {
        if (err) {
          console.error('There was a problem for updating user record');
          return null;
        } else if (updateResult) {
          console.info('User updated successfully');
          return updateResult;
        }
        console.info('User not updated!!');
        return null;
      });

      if (userResult._update) {
        return res.status(200).json({
          message: 'User updated successfully',
          code: 200,
          data: userResult._update,
        });
      }
      console.info('No Operations Performed in User');
      res.status(200).json({
        message: 'No Operations Performed',
        code: 400,
        data: null,
      });
    }
  });
});

module.exports = router;

