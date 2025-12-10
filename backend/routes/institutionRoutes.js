// backend/routes/institutionRoutes.js
const express = require('express');
const router = express.Router();
const Institution = require('../models/institution');

// @route   GET /api/institutions
// @desc    Get all institution names and IDs (public)
router.get('/', async (req, res) => {
    try {
        // This is no longer needed, as students register with a code.
        // Kept in case you want a public list, but can be removed.
        const institutions = await Institution.find().select('name _id');
        res.json({ success: true, data: institutions });
    } catch (err) {
        console.error("Error fetching institutions:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;