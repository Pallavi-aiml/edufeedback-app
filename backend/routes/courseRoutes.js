// backend/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse 
} = require('../controllers/courseController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getCourses); // Now filters by student's semester/dept
router.post('/', protect, admin, createCourse);
router.put('/:id', protect, admin, updateCourse);
router.delete('/:id', protect, admin, deleteCourse);

module.exports = router;