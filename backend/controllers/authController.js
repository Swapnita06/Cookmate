const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

exports.register = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    try {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            email,
            password: hashedPassword,
            name,
            savedRecipes: [],
            createdRecipes: [],
            favRecipes: []
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Return response
        res.status(201).json({
            message: "User registered successfully",
            userId: user._id,
            token,
            email: user.email,
            name: user.name
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: "Registration failed. Please try again." });
    }
};

// Login User
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            message: "Login successful",
            token,
            userId: user._id,
            email: user.email,
            name: user.name
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Login failed. Please try again." });
    }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
    try {
          console.log('User ID:', req.userId); 
        const user = await User.findById(req.userId)
            .select('-password -__v') // Exclude sensitive fields
            // .populate('savedRecipes createdRecipes favRecipes');
             .populate({
        path: 'savedRecipes createdRecipes favRecipes',
          select: 'title description image ingredients',
        options: { strictPopulate: false } // Temporarily allow missing models
      });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: "Failed to fetch user profile" });
    }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
    const { name, email } = req.body;

    try {
        // Check if email is being updated to one that already exists
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== req.userId) {
                return res.status(400).json({ message: "Email already in use" });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { $set: { name, email } },
            { new: true, runValidators: true }
        ).select('-password -__v');

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: "Failed to update profile" });
    }
};