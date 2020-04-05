let mongoose = require("mongoose");

// Team Schema
//TODO mange til mange relation
let courseSchema = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  seats: {
    type: Number,
    required: true
  },
  place: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    require: true
  },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lessons: [{type: mongoose.Schema.Types.ObjectId, ref: "Lesson"}]
});
let Course = (module.exports = mongoose.model("Course", courseSchema));
