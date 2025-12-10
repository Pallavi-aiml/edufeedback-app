// backend/controllers/courseController.js
const Course = require('../models/course');

exports.getCourses = async (req, res) => {
  try {
    let query = { institution: req.user.institution };

    if (req.user.role === 'student') {
        // Students ONLY see courses matching their semester AND department
        query.semester = req.user.currentSemester;
        query.department = req.user.department;
    } 
    else if (req.user.role === 'admin') {
        // Admins can optionally filter by semester or department
        if (req.query.semester) {
            query.semester = req.query.semester;
        }
        if (req.query.department) {
            query.department = req.query.department;
        }
    }

    console.log("Fetching courses with query:", query);
    const courses = await Course.find(query);
    res.json({ success: true, data: courses });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { courseCode, courseName, instructor, department, semester } = req.body;

    if (!courseCode || !courseName || !instructor || !department || !semester) {
        return res.status(400).json({ success: false, message: "Please provide all course fields." });
    }

    const newCourse = new Course({
      courseCode, courseName, instructor, department, 
      semester,
      institution: req.user.institution
    });
    await newCourse.save();
    res.status(201).json({ success: true, data: newCourse });
  } catch (err) {
    console.error("Error creating course:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course || course.institution.toString() !== req.user.institution.toString()) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: course });
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || course.institution.toString() !== req.user.institution.toString()) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    await course.remove();
    res.json({ success: true, message: "Course deleted successfully" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};