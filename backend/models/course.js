// backend/models/course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, trim: true },
  courseName: { type: String, required: true, trim: true },
  instructor: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  semester: { type: String, required: true, trim: true }, 
  institution: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Institution', 
    required: true 
  },
});

module.exports = mongoose.model('Course', courseSchema);