// backend/models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], required: true },
    
    institution: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Institution', 
        required: true 
    },
    
    // Fields required only for students
    currentSemester: {
        type: String,
        required: function() { return this.role === 'student'; } 
    },
    department: {
        type: String,
        required: function() { return this.role === 'student'; },
        trim: true
    },
    
    isVerified: { type: Boolean, default: false },
    verificationCode: String,
    resetToken: String,
    resetTokenExpiry: Date,
});

module.exports = mongoose.model("User", userSchema);