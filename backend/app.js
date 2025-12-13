// backend/app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const feedbackRoutes = require('./routes/feedbackRoutes');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const institutionRoutes = require('./routes/institutionRoutes');

const app = express();

// --- CORS SETUP ---
app.use(cors({
    origin: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.options('*', cors()); // Fix: * works better for splat handling in express

// Middleware
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/institutions', institutionRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is working...');
});

// --- CRITICAL CHANGE FOR VERCEL ---
// Only start the server if we are running locally (not in production/Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => { 
      console.log(`🚀 Server running locally at http://localhost:${PORT}`);
    });
}

// Export the app so Vercel can run it as a Serverless Function
module.exports = app;