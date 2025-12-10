// backend/models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
    semester: { type: String, required: true, trim: true },
    ratings: { 
        overall: { type: Number, required: true, min: 1, max: 5 },
        instructor: { type: Number, required: true, min: 1, max: 5 },
        content: { type: Number, required: true, min: 1, max: 5 }
    },
    workload: { 
        type: String, 
        enum: ['very-light', 'light', 'moderate', 'heavy', 'very-heavy'], 
        required: true 
    },
    difficulty: { 
        type: String, 
        enum: ['very-easy', 'easy', 'moderate', 'difficult', 'very-difficult'], 
        required: true 
    },
    feedback: { type: String, required: true, trim: true }, 
    sentiment: { 
        type: String, 
        enum: ['positive', 'neutral', 'negative'], 
        required: true 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);