const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get user's support tickets
// @route   GET /api/v1/support/tickets
// @access  Private
exports.getUserTickets = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Handle demo user - return empty tickets
    if (req.user.id === 'demo-user-1') {
      return res.status(200).json({
        success: true,
        data: {
          tickets: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          }
        }
      });
    }

    const tickets = await SupportTicket.getUserTickets(req.user.id, {
      status,
      category,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    const total = await SupportTicket.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching support tickets'
    });
  }
};

// @desc    Get single support ticket
// @route   GET /api/v1/support/tickets/:ticketId
// @access  Private
exports.getTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({
      ticketId: req.params.ticketId,
      userId: req.user.id
    }).populate('responses.author', 'name email role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { ticket }
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching support ticket'
    });
  }
};

// @desc    Create new support ticket
// @route   POST /api/v1/support/tickets
// @access  Private
exports.createTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { subject, message, category, priority } = req.body;
    
    // Handle demo user
    if (req.user.id === 'demo-user-1') {
      // Create a mock ticket response for demo user
      const mockTicket = {
        id: `demo-ticket-${Date.now()}`,
        ticketId: `TKT-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        subject,
        message,
        category,
        priority,
        status: 'open',
        userId: req.user.id,
        userEmail: req.user.email,
        userName: req.user.name,
        createdAt: new Date(),
        lastUpdated: new Date(),
        responses: [{
          message,
          author: {
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
          },
          authorType: 'user',
          timestamp: new Date()
        }]
      };

      return res.status(201).json({
        success: true,
        message: 'Support ticket created successfully (Demo)',
        data: { ticket: mockTicket }
      });
    }

    const user = await User.findById(req.user.id);

    const ticket = await SupportTicket.create({
      subject,
      message,
      category,
      priority,
      userId: req.user.id,
      userEmail: user.email,
      userName: user.name,
      responses: [{
        message,
        author: req.user.id,
        authorType: 'user',
        timestamp: new Date()
      }]
    });

    // Populate the created ticket
    await ticket.populate('responses.author', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: { ticket }
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating support ticket'
    });
  }
};

// @desc    Add response to support ticket
// @route   POST /api/v1/support/tickets/:ticketId/responses
// @access  Private
exports.addResponse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { message } = req.body;

    const ticket = await SupportTicket.findOne({
      ticketId: req.params.ticketId,
      userId: req.user.id
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    if (ticket.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add response to closed ticket'
      });
    }

    ticket.responses.push({
      message,
      author: req.user.id,
      authorType: 'user',
      timestamp: new Date()
    });

    // Reopen ticket if it was resolved
    if (ticket.status === 'resolved') {
      ticket.status = 'open';
    }

    await ticket.save();
    await ticket.populate('responses.author', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: { ticket }
    });
  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding response'
    });
  }
};

// @desc    Close support ticket
// @route   PUT /api/v1/support/tickets/:ticketId/close
// @access  Private
exports.closeTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({
      ticketId: req.params.ticketId,
      userId: req.user.id
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    if (ticket.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is already closed'
      });
    }

    ticket.status = 'closed';
    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Support ticket closed successfully',
      data: { ticket }
    });
  } catch (error) {
    console.error('Close ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error closing support ticket'
    });
  }
};

// @desc    Rate support ticket
// @route   PUT /api/v1/support/tickets/:ticketId/rate
// @access  Private
exports.rateTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, feedback } = req.body;

    const ticket = await SupportTicket.findOne({
      ticketId: req.params.ticketId,
      userId: req.user.id
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }

    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate resolved or closed tickets'
      });
    }

    ticket.rating = rating;
    if (feedback) ticket.feedback = feedback;

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket rating submitted successfully',
      data: { ticket }
    });
  } catch (error) {
    console.error('Rate ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rating support ticket'
    });
  }
};

// @desc    Get ticket statistics
// @route   GET /api/v1/support/stats
// @access  Private
exports.getTicketStats = async (req, res) => {
  try {
    // Handle demo user
    if (req.user.id === 'demo-user-1') {
      return res.status(200).json({
        success: true,
        data: { stats: {} } // Empty stats for demo user
      });
    }

    const stats = await SupportTicket.getTicketStats(req.user.id);

    // Convert array to object for easier frontend consumption
    const statsObj = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: { stats: statsObj }
    });
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching ticket statistics'
    });
  }
};

// @desc    Get FAQ items
// @route   GET /api/v1/support/faq
// @access  Public
exports.getFAQ = async (req, res) => {
  try {
    const { search, category } = req.query;

    // Static FAQ data - in a real app, this might come from a database
    let faqItems = [
      {
        category: 'Getting Started',
        questions: [
          {
            id: 'gs-1',
            question: 'How do I create my first trading strategy?',
            answer: 'Navigate to the Strategies section and click "Create Strategy". You can choose from templates or build from scratch using our visual builder or code editor.',
            tags: ['strategy', 'create', 'getting started']
          },
          {
            id: 'gs-2',
            question: 'What is paper trading and how do I start?',
            answer: 'Paper trading is simulated trading with virtual money. Go to Paper Trading section, deploy a strategy, and start trading without real money risk.',
            tags: ['paper trading', 'simulation', 'getting started']
          },
          {
            id: 'gs-3',
            question: 'How do I run a backtest?',
            answer: 'Select a strategy, go to Backtesting, configure your parameters (date range, capital, etc.), and click "Run Backtest".',
            tags: ['backtest', 'testing', 'strategy']
          }
        ]
      },
      {
        category: 'Trading & Strategies',
        questions: [
          {
            id: 'ts-1',
            question: 'Can I modify a strategy template?',
            answer: 'Yes, you can clone any template and modify it according to your needs. Templates serve as starting points for your custom strategies.',
            tags: ['template', 'modify', 'strategy']
          },
          {
            id: 'ts-2',
            question: 'What data feeds are available?',
            answer: 'We provide real-time and historical data for Indian equities, with plans to expand to other markets and asset classes.',
            tags: ['data', 'feeds', 'market data']
          },
          {
            id: 'ts-3',
            question: 'How accurate are the backtest results?',
            answer: 'Our backtests include realistic factors like slippage, commissions, and market impact to provide accurate historical performance estimates.',
            tags: ['backtest', 'accuracy', 'results']
          }
        ]
      },
      {
        category: 'Account & Billing',
        questions: [
          {
            id: 'ab-1',
            question: 'How do I upgrade my plan?',
            answer: 'Go to Settings > Billing and select the plan that suits your needs. You can upgrade or downgrade at any time.',
            tags: ['upgrade', 'plan', 'billing']
          },
          {
            id: 'ab-2',
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards, debit cards, and UPI payments. International cards are also supported.',
            tags: ['payment', 'methods', 'billing']
          },
          {
            id: 'ab-3',
            question: 'Can I cancel my subscription anytime?',
            answer: 'Yes, you can cancel your subscription at any time. You will retain access until the end of your current billing period.',
            tags: ['cancel', 'subscription', 'billing']
          }
        ]
      }
    ];

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      faqItems = faqItems.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q =>
          q.question.toLowerCase().includes(searchLower) ||
          q.answer.toLowerCase().includes(searchLower) ||
          q.tags.some(tag => tag.toLowerCase().includes(searchLower))
        )
      })).filter(cat => cat.questions.length > 0);
    }

    // Filter by category
    if (category) {
      faqItems = faqItems.filter(cat =>
        cat.category.toLowerCase() === category.toLowerCase()
      );
    }

    res.status(200).json({
      success: true,
      data: { faqItems }
    });
  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching FAQ'
    });
  }
};

module.exports = exports;