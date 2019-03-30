// StudentController.js
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var jwt = require('jsonwebtoken');
var config = require('../../config');
var Student = require('../models/Student');
var SequenceNumber = require('../models/SequenceNumber')

numberGeneretor = () => {
  SequenceNumber.findOne({}, {}, { sort: { 'createdAt': -1 } }, function (err, post) {
    if(err) return null;
    var tempNum = post.admissionNumber;
    console.log('tempNum :', tempNum);
    SequenceNumber.findOneAndUpdate({ _id: post._id }, { admissionNumber: tempNum + 1, createdAt: new Date }, (err, createResult) => {
      if (err) {
        console.error('Error in Sequence Number generation :', err);
      } else if (createResult) {
        console.error('Sequence Number generation :', createResult.admissionNumber);
      }
    });
  });
}
// CREATES A NEW STUDENT
router.post('/create', (req, res) => {
  var customNum = '';

  return Student.findOne({ aadharNumber: req.body.aadharNumber }, (err, findResult) => {
    if (err) {
      console.error('There was a problem for finding the student on admission number');
      return res.status(500).json({
        message: 'There was a problem for finding the student',
        code: 500,
        data: null,
      });
    } else if (findResult) {
      console.info('Student already registered by this admission number:', findResult.aadharNumber);
      return res.status(200).json({
        message: 'Student already registered by this admission number:' + findResult.aadharNumber,
        code: 300,
        data: null,
      });
    }
    return SequenceNumber.findOne({}, {}, { sort: { 'createdAt': -1 } }, function (err, sequenceResult) {
      if (err) {
        return res.status(500).json({
          message: 'There was a problem for generating admission number',
          code: 500,
          data: null,
        });
      } else {
        var admissionSequence = sequenceResult.admissionNumber;
        var customNum = '';
        if (admissionSequence < 10) {
          customNum = ("MVIT -00" + admissionSequence);
        } else if (admissionSequence >= 10 && admissionSequence < 100) {
          customNum = ("MVIT -0" + admissionSequence);
        } else {
          customNum = ("MVIT -" + admissionSequence);
        }
        numberGeneretor()
        var student = ctudentRecordConverter(req.body, customNum.replace(/\s/g, ""))
        return Student.create(student, (err, createResult) => {
          if (err) {
            console.error('Error in Student register page :', err);
            return res.status(500).json({
              message: 'There was a problem for student register',
              code: 500,
              data: null,
            });
          } else if (createResult) {
            console.info('Student Registered Successfully');
            return res.status(200).json({
              message: 'Student Registered Successfully',
              code: 200,
              data: createResult,
            });
          }
        });
      }
    }); 
  });
});

isValidToken = (token) => {
  const jwtDecode = jwt.verify(token, config.secret, function (err, decoded) {
    if (decoded) {
      return decoded;
    } else {
      return null;
    }
  });
  if (jwtDecode) {
    return true;
  } 
  return false;
}

// RETURNS ALL THE STUDENTS IN THE DATABASE
router.get('/', function (req, res) {

  // check me(token) if you want to access base role or authentication:
  // var token = req.headers['access-token'];
  // if (!token) {
  //   return res.status(200).json({
  //     message: 'User Access-Token not found',
  //     code: 404,
  //     data: null,
  //   });
  // }
  // if (!isValidToken(token)) {
  //   return res.status(401).json({
  //       message: 'User Authentication failure',
  //       code: 401,
  //       data: null,
  //     });
  // }
  Student.paginate({}, { page: (Number)(req.query.page), limit: (Number)(req.query.limit) }, function (err, results) {
    if (err) {
      console.error('Error in students finding page :', err);
      return res.status(500).json({
        message: 'There was a problem for finding the student',
        code: 500,
        data: null,
      });
    } else if (results){
      console.info('Students Records Fund and returned');
      return res.status(200).json({
        message: 'Student(s) Data Fetched Successfully',
        code: 200,
        data: results,
      });
    }
    console.info('No Operations Performed in Students Fetch');
    res.status(200).json({
      message: 'No Operations Performed',
      code: 400,
      data: null,
    });
  });
});

// GET LIST OF STUDENTS BY NAME SEARCH
router.get('/search', function (req, res) {

  console.log('req.query.firstName :', req.query.firstName);
  return Student.paginate({ firstName: req.query.firstName}, { page: (Number)(req.query.page), limit: (Number)(req.query.limit) }, function (err, results) {
          if (err) {
            console.error('Error in students finding page :', err);
            return res.status(500).json({
              message: 'There was a problem for finding the student',
              code: 500,
              data: null,
            });
          } else if (results) {
            console.info('Students Records Fund and returned');
            return res.status(200).json({
              message: 'Student(s) Data Fetched Successfully',
              code: 200,
              data: results,
            });
          }
          console.info('No Operations Performed in Students Fetch');
          return res.status(200).json({
            message: 'No Operations Performed',
            code: 400,
            data: null,
          });
        });
});

// GETS A SINGLE STUDENT FROM THE DATABASE
router.get('/:id', function (req, res) {
  Student.findById(req.params.id, function (err, findResult) {
    if (err) {
      console.error('Error in students finding page :', err);
      return res.status(500).json({
        message: 'Error in students finding',
        code: 500,
        data: null,
      });
    } else if (findResult){
      console.info('Students Fund and returned');
      return res.status(200).json({
        message: 'Student Fetched Successfully',
        code: 200,
        data: findResult,
      });
    }
    console.info('No Operations Performed in Student Fetch');
    res.status(200).json({
      message: 'No Operations Performed',
      code: 400,
      data: null,
    });
  });
});

// DELETES A STUDENT FROM THE DATABASE
router.delete('/:id', function (req, res) {
  Student.findByIdAndRemove(req.params.id, function (err, removeResult) {
    if (err) {
      console.error('Error in Student deleting page :', err);
      return res.status(500).json({
        message: 'Error in Student deleting',
        code: 500,
        data: null,
      });
    } else if (removeResult) {
      console.info('Student Record Deleted and returned');
      res.status(200).json({
        message: 'Student Record Deleted Successfully',
        code: 200,
        data: true,
      });
    }
    console.info('No Operations Performed in Student Delete');
    res.status(200).json({
      message: 'No Operations Performed',
      code: 400,
      data: null,
    });
  });
});

// UPDATES A SINGLE STUDENT IN THE DATABASE
router.post('/update/:id', function (req, res) {

  Student.findOne({ _id: req.params.id }, (err, findResult) => {
    if (err) {
      console.error('There was a problem for finding the student on admission number');
      return res.status(500).json({ message: "There was a problem finding the student on admission number." });
    } else if (findResult) {

      var studentRecord = ctudentRecordConverter(req.body, null, true);

      console.log('converted studentRecord :', studentRecord);

      const studentResult = Student.findOneAndUpdate({ _id: req.params.id }, studentRecord, (err, updateResult) => {
        if (err) {
          console.error('There was a problem for updating student record');
          return null;
        } else if (updateResult) {
          console.info('Student updated successfully');
          return updateResult;
        }
        console.info('Student not updated!!');
        return null; 
      });
  
      if (studentResult._update) {
        return res.status(200).json({
          message: 'Student updated successfully',
          code: 200,
          data: studentResult._update,
        });
      }
      console.info('No Operations Performed in Student Update');
      res.status(200).json({
        message: 'No Operations Performed',
        code: 400,
        data: null,
      });
    }
  });
});

ctudentRecordConverter = (record, number, isUpdate = false) => {
  if (isUpdate){
    return studentUpdateObject(record)
  } else {
    var student = new Student(studentCreateObject(record, number));
    return student;
  }
}

studentCreateObject = (record, number) => {
  const student = {
    firstName: record.firstName,
    lastName: record.lastName,
    class: record.class,
    section: record.section,
    admissionNumber: number,
    rollNumber: record.rollNumber,
    dateOfBirth: record.dateOfBirth,
    gender: record.gender,
    religion: record.religion,
    caste: record.caste,
    diceNumber: record.diceNumber,
    aadharNumber: record.aadharNumber,
    previousSchoolDiceNumber: record.previousSchoolDiceNumber,
    dateOfAdmission: record.dateOfAdmission ? record.dateOfAdmission : new Date(),
    parentDetails: {
      fatherName: record.parentDetails.fatherName,
      motherName: record.parentDetails.motherName,
      phoneNumber: record.parentDetails.phoneNumber,
      alternateNumber: record.parentDetails.alternateNumber,
      fatherOccupation: record.parentDetails.fatherOccupation,
      motherOccupation: record.parentDetails.motherOccupation,
      fatherAadharNo: record.parentDetails.fatherAadharNo,
      motherAadharNo: record.parentDetails.motherAadharNo,
    },
    address: {
      doorNum: record.address.doorNum,
      street: record.address.street,
      locality: record.address.locality,
      city: record.address.city,
      state: record.address.state,
      pincode: record.address.pincode,
      contact: record.address.contact,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  return student
}

studentUpdateObject = (record) => {
  const student = {
    firstName: record.firstName,
    lastName: record.lastName,
    class: record.class,
    section: record.section,
    rollNumber: record.rollNumber,
    dateOfBirth: record.dateOfBirth,
    gender: record.gender,
    religion: record.religion,
    caste: record.caste,
    diceNumber: record.diceNumber,
    aadharNumber: record.aadharNumber,
    previousSchoolDiceNumber: record.previousSchoolDiceNumber,
    dateOfAdmission: record.dateOfAdmission && record.dateOfAdmission,
    parentDetails: {
      fatherName: record.parentDetails.fatherName,
      motherName: record.parentDetails.motherName,
      phoneNumber: record.parentDetails.phoneNumber,
      alternateNumber: record.parentDetails.alternateNumber,
      fatherOccupation: record.parentDetails.fatherOccupation,
      motherOccupation: record.parentDetails.motherOccupation,
      fatherAadharNo: record.parentDetails.fatherAadharNo,
      motherAadharNo: record.parentDetails.motherAadharNo,
    },
    address: {
      doorNum: record.address.doorNum,
      street: record.address.street,
      locality: record.address.locality,
      city: record.address.city,
      state: record.address.state,
      pincode: record.address.pincode,
      contact: record.address.contact,
    },
    updatedAt: new Date(),
  }
  return student
}

module.exports = router;

