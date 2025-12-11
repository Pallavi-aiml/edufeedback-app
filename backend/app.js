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

// --- 1. STRONGER CORS SETUP ---
// This configuration dynamically allows your Vercel frontend and handles preflight checks.
app.use(cors({
    origin: true, // Dynamically allow the request origin (better than '*')
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Allow cookies/headers to be sent
}));

// Handle Preflight Requests (OPTIONS) for all routes
app.options('/*', cors());

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

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => { 
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});