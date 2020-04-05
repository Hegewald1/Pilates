let mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
// User Schema
//TODO: unik email virker ikke selvom den er unique
let userSchema = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    required: true,
    default: false,
    index: true
  }
});
userSchema.plugin(uniqueValidator);

let User = mongoose.model("User", userSchema);
module.exports = User;