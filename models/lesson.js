let mongoose = require("mongoose");

// Team Schema
//TODO mange til mange relation
let lessonSchema = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  lessonName: {
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
  date: {
    type: Date,
    require: true
  },
  place: {
    type: String,
    required: true
  },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});
let Lesson = (module.exports = mongoose.model("Lesson", lessonSchema));
