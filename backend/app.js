const express = require('express');
const mongoose = require('mongoose');
require('./models/Receipes');
require('./models/User');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
const userRoutes = require('./routes/user_routes');
const recipeRoutes= require('./routes/receipe_routes')
app.use('/api/users', userRoutes);
app.use('/api/receipe',recipeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;