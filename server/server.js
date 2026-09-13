const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

const app = express();
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.use('/exports', express.static('exports'));

// Routes
const authRoutes = require('./routes/authRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const aiRoutes = require('./routes/aiRoutes');
const exportRoutes = require('./routes/exportRoutes');
const emailRoutes = require('./routes/emailRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/meetings', aiRoutes);
app.use('/api/meetings', exportRoutes);
app.use('/api/meetings', emailRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('MeetMind AI API is running');
});

// Error handling middleware
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
