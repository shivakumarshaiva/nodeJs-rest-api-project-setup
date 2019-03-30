var mongoose = require('mongoose');
var Schema = Schema = mongoose.Schema;

var SequenceNumber = new Schema({
  admissionNumber: Number,
  createdAt: {
    type: Date,
  },
});

module.exports = mongoose.model('SequenceNumber', SequenceNumber);;