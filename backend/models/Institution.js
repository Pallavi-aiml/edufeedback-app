// backend/models/Institution.js
const mongoose = require('mongoose');
const shortid = require('shortid');

const institutionSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true, // Name is now the unique key
    trim: true 
  },
  collegeCode: {
    type: String,
    unique: true,
    default: shortid.generate // Automatically generates a unique code
  },
  subscriptionPlan: { 
    type: String, 
    enum: ['pilot', 'pro', 'enterprise'], 
    default: 'pilot' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Institution', institutionSchema);