const Contact = require('../models/Contact');
const { validationResult } = require('express-validator');
const emailService = require('../utils/emailService');

// @desc    Submit contact form
// @route   POST /api/v1/contact
// @access  Public
exports.submitContactForm = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;

    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    // Create contact submission
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      userId: req.user?.id || null, // If user is logged in
      ipAddress,
      userAgent
    });

    // Send confirmation email to user
    try {
      await emailService.sendContactConfirmation(email, name, subject);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification email to admin
    try {
      await emailService.sendContactNotification({
        name,
        email,
        subject,
        message,
        contactId: contact._id
      });
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all contact submissions (Admin only)
// @route   GET /api/v1/contact
// @access  Private/Admin
exports.getContactSubmissions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-userAgent -ipAddress');

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving contact submissions',
      error: error.message
    });
  }
};

// @desc    Get single contact submission (Admin only)
// @route   GET /api/v1/contact/:id
// @access  Private/Admin
exports.getContactSubmission = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).populate('userId', 'name email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error fetching contact submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving contact submission',
      error: error.message
    });
  }
};

// @desc    Update contact submission status (Admin only)
// @route   PUT /api/v1/contact/:id
// @access  Private/Admin
exports.updateContactStatus = async (req, res) => {
  try {
    const { status, notes, replied } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    if (status) contact.status = status;
    if (notes) contact.notes = notes;
    if (replied !== undefined) {
      contact.replied = replied;
      if (replied) contact.repliedAt = new Date();
    }

    await contact.save();

    res.status(200).json({
      success: true,
      message: 'Contact submission updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Error updating contact submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact submission',
      error: error.message
    });
  }
};

// @desc    Delete contact submission (Admin only)
// @route   DELETE /api/v1/contact/:id
// @access  Private/Admin
exports.deleteContactSubmission = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Contact submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact submission',
      error: error.message
    });
  }
};
