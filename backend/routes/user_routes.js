const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const checkAuth = require('../middlewares/checkAuth')

// User registration route
router.post('/register', [
    check('email').isEmail().normalizeEmail().withMessage('Must be a valid email'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    check('name').not().isEmpty().trim().withMessage('Name is required')
], authController.register);

// User login
router.post('/login', [
    check('email').isEmail().normalizeEmail().withMessage('Must be a valid email'),
    check('password').not().isEmpty().withMessage('Password is required')
], authController.login);

// Get user profile (protected route)
router.get('/get_profile', checkAuth, authController.getUserProfile);

// Update user profile (protected route)
router.put('/profile', [
    checkAuth,
    check('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    check('email').optional().isEmail().normalizeEmail().withMessage('Must be a valid email')
], authController.updateUserProfile);

// New verification routes
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

module.exports = router;