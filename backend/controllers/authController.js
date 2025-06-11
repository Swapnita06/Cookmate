const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    secure: true,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
    rejectUnauthorized: false
  }
});

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

// Generate verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Create user
        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            email,
            password: hashedPassword,
            name,
             isVerified: false,
            verificationToken,
            verificationTokenExpires,
            savedRecipes: [],
            createdRecipes: [],
            favRecipes: []
        });

        await user.save();

        // Generate token
        //const token = generateToken(user._id);

            // Send verification email
        // const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;
      // const verificationUrl = `${process.env.FRONTEND_URL}/api/users/verify-email?token=${verificationToken}`;
      const verificationUrl = `${process.env.BASE_URL}/api/users/verify-email?token=${verificationToken}`;
       //const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const mailOptions = {
            from: `"CookMate" <${process.env.EMAIL_USERNAME}>`,
            to: email,
            subject: 'Verify Your Email for CookMate',
            html: `
                <h2>Welcome to CookMate!</h2>
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationUrl}">Verify Email</a>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account with CookMate, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({
            message: "Registration successful! Please check your email to verify your account.",
            userId: user._id,
            email: user.email,
            name: user.name
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: "Registration failed. Please try again." });
    }
};

// Add email verification endpoint
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

      if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/verify-email?success=false&message=Invalid+token`);
        }

    // if (!user) {
    //         // Return JSON response for API calls
    //         if (req.accepts('json')) {
    //             return res.status(400).json({ 
    //                 success: false,
    //                 message: "Invalid or expired verification token" 
    //             });
    //         }
    //         // Redirect for direct link clicks
    //         return res.redirect(`${process.env.FRONTEND_URL}/verify-email?success=false&message=Invalid+token`);
    //     }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();
  return res.redirect(`${process.env.FRONTEND_URL}/verify-email?success=true`);
        //res.status(200).json({ message: "Email verified successfully! You can now log in." });
    } catch (error) {
        console.error('Email verification error:', error);
       //res.status(500).json({ message: "Email verification failed" });
   return res.redirect(`${process.env.FRONTEND_URL}/verify-email?success=false`);
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

if (!user.isVerified) {
            return res.status(403).json({ 
                message: "Account not verified. Please check your email for verification link.",
                userId: user._id
            });
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


// Add resend verification email endpoint
exports.resendVerification = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await user.save();

        // Send verification email
        const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;
        
        const mailOptions = {
            from: `"CookMate" <${process.env.EMAIL_USERNAME}>`,
            to: user.email,
            subject: 'Verify Your Email for CookMate',
            html: `
                <h2>Welcome to CookMate!</h2>
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationUrl}">Verify Email</a>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account with CookMate, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Verification email resent successfully!" });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: "Failed to resend verification email" });
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