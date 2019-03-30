var express = require('express');
var router = express.Router();
var multer = require('multer');
var config = require('../../config')
var AWS = require('aws-sdk');
var Student = require('../models/Student');

var storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, '');
  }
});

var multipleUpload = multer({ storage: storage }).array('file');
var upload = multer({ storage: storage }).single('file');

router.post('/upload', upload, function (req, res) {

  console.info('_studentId :', req.body._studentId && req.body._studentId.replace(/['"]+/g, ''));

  const file = req.file;
  const studentId = req.body._studentId && req.body._studentId.replace(/['"]+/g, '');

  AWS.config.update(config.studentS3Key);

  let s3bucket = new AWS.S3();

  return s3bucket.createBucket(function () {
    let Bucket_Path = 'student-p-photos';
    //Where you want to store your file
    var ResponseData = [];

    var params = {
      Bucket: Bucket_Path,
      Key: file.originalname,
      Body: file.buffer,
      ACL: 'public-read'
    };

    s3bucket.upload(params, function (err, data) {
      if (err) {
        console.info('s3 err :', err);
        res.json({ "error": true, "Message": err });
      } else {
        console.info('file saved successfully, url :', data.Location);
        const studentResult = Student.findOneAndUpdate({ _id: studentId }, { profilePic: data.Location }, (err, updateResult) => {
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
      }
    });
  });
});
module.exports = router;