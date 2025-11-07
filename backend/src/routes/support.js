const express = require('express');
const { body } = require('express-validator');
const {
  getUserTickets,
  getTicket,
  createTicket,
  addResponse,
  closeTicket,
  rateTicket,
  getTicketStats,
  getFAQ
} = require('../controllers/supportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/faq', getFAQ);

// Protected routes
router.use(protect);

// Ticket routes
router.route('/tickets')
  .get(getUserTickets)
  .post([
    body('subject').notEmpty().trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
    body('message').notEmpty().trim().isLength({ min: 10, max: 5000 }).withMessage('Message must be between 10 and 5000 characters'),
    body('category').isIn(['general', 'technical', 'billing', 'bug', 'feature']).withMessage('Invalid category'),
    body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
  ], createTicket);

router.route('/tickets/:ticketId')
  .get(getTicket);

router.post('/tickets/:ticketId/responses', [
  body('message').notEmpty().trim().isLength({ min: 1, max: 5000 }).withMessage('Message must be between 1 and 5000 characters')
], addResponse);

router.put('/tickets/:ticketId/close', closeTicket);

router.put('/tickets/:ticketId/rate', [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().trim().isLength({ max: 1000 }).withMessage('Feedback cannot be more than 1000 characters')
], rateTicket);

router.get('/stats', getTicketStats);

module.exports = router;