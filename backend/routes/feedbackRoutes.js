// backend/routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const { submitFeedback, getAnalytics } = require('../controllers/feedbackController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, submitFeedback);
router.get('/analytics', protect, admin, getAnalytics);

module.exports = router;