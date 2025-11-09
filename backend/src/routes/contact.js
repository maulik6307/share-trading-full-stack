const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  submitContactForm,
  getContactSubmissions,
  getContactSubmission,
  updateContactStatus,
  deleteContactSubmission
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const contactValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ max: 200 }).withMessage('Subject cannot exceed 200 characters'),
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters')
];

// Public route - anyone can submit contact form
router.post('/', contactValidation, submitContactForm);

// Admin routes - require authentication and admin role
router.get('/', protect, authorize('admin'), getContactSubmissions);
router.get('/:id', protect, authorize('admin'), getContactSubmission);
router.put('/:id', protect, authorize('admin'), updateContactStatus);
router.delete('/:id', protect, authorize('admin'), deleteContactSubmission);

module.exports = router;
