// backend/app.js (or server.js)
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

// Middleware
app.use(express.json());

// --- FIX: UPDATED CORS SETTINGS ---
// This allows your Vercel frontend to talk to this Railway backend without blocking.
app.use(cors({
    origin: '*', // Allow connections from ANY website (including Vercel)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these actions
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow these headers
}));

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
app.listen(PORT, '0.0.0.0', () => { // Added '0.0.0.0' to ensure it listens on all interfaces in Railway
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});