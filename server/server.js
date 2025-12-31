const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize Firebase Admin
require('./config/firebase');

const connectDB = require('./config/db');
const reportsRoutes = require('./routes/reportsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const geocodingRoutes = require('./routes/geocodingRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173', // localhost for local dev
      'https://crimetrack.vercel.app', // new Vercel frontend URL
    ],
    credentials: true, // Important for cookies/sessions
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/geocoding', geocodingRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'CrimeTrack API is running' });
});

app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
