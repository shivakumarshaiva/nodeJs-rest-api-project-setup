var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var Schema = Schema = mongoose.Schema;

var UserSchema = new Schema({
  usersName: String,
  userEmail: String,
  password: String,
  role: Array,
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  }
});

UserSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('User', UserSchema);;