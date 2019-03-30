var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = Schema = mongoose.Schema;

var StudentSchema = new Schema({
  firstName: String,
  lastName: String,
  admissionNumber: String,
  rollNumber: String,
  profilePic: String,
  class: String,
  section: String,
  dateOfBirth: {
    type: Date,
  },
  gender: String,
  religion: String,
  caste: String,
  dateOfAdmission: {
    type: Date,
  },
  diceNumber: String,
  aadharNumber: String,
  previousSchoolDiceNumber: Number,
  parentDetails: {
    fatherName: String,
    motherName: String,
    phoneNumber: Number,
    alternateNumber: Number,
    fatherOccupation: String,
    motherOccupation: String,
    fatherAadharNo: String,
    motherAadharNo: String,
  },
  address: {
    doorNum: String,
    street: String,
    locality: String,
    city: String,
    state: String,
    pincode: Number,
    contact: Number,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  }
});
StudentSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Student', StudentSchema);;