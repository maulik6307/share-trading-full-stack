'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Button, Input, Label, useToast } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { HelpCircle, MessageSquare, Book, Video, Mail, Phone, Clock, Search, ExternalLink } from 'lucide-react';

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  lastUpdated: Date;
  category: string;
}

export default function SupportPage() {
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'help' | 'contact' | 'tickets'>('help');
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  // Load user tickets
  const loadTickets = async () => {
    setTicketsLoading(true);
    try {
      const { supportAPI } = await import('@/lib/api/support');
      const response = await supportAPI.getTickets();
      setTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setTicketsLoading(false);
    }
  };

  // Load tickets when switching to tickets tab
  React.useEffect(() => {
    if (activeTab === 'tickets') {
      loadTickets();
    }
  }, [activeTab]);

  const faqItems = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'How do I create my first trading strategy?',
          answer: 'Navigate to the Strategies section and click "Create Strategy". You can choose from templates or build from scratch using our visual builder or code editor.',
        },
        {
          question: 'What is paper trading and how do I start?',
          answer: 'Paper trading is simulated trading with virtual money. Go to Paper Trading section, deploy a strategy, and start trading without real money risk.',
        },
        {
          question: 'How do I run a backtest?',
          answer: 'Select a strategy, go to Backtesting, configure your parameters (date range, capital, etc.), and click "Run Backtest".',
        },
      ],
    },
    {
      category: 'Trading & Strategies',
      questions: [
        {
          question: 'Can I modify a strategy template?',
          answer: 'Yes, you can clone any template and modify it according to your needs. Templates serve as starting points for your custom strategies.',
        },
        {
          question: 'What data feeds are available?',
          answer: 'We provide real-time and historical data for Indian equities, with plans to expand to other markets and asset classes.',
        },
        {
          question: 'How accurate are the backtest results?',
          answer: 'Our backtests include realistic factors like slippage, commissions, and market impact to provide accurate historical performance estimates.',
        },
      ],
    },
    {
      category: 'Account & Billing',
      questions: [
        {
          question: 'How do I upgrade my plan?',
          answer: 'Go to Settings > Billing and select the plan that suits your needs. You can upgrade or downgrade at any time.',
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards, debit cards, and UPI payments. International cards are also supported.',
        },
        {
          question: 'Can I cancel my subscription anytime?',
          answer: 'Yes, you can cancel your subscription at any time. You will retain access until the end of your current billing period.',
        },
      ],
    },
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { supportAPI } = await import('@/lib/api/support');
      
      await supportAPI.createTicket({
        subject: contactForm.subject,
        message: contactForm.message,
        category: contactForm.category as any,
        priority: contactForm.priority as any,
      });
      
      addToast({
        type: 'success',
        title: 'Ticket Created',
        description: 'Your support ticket has been created. We will respond within 24 hours.',
      });
      
      setContactForm({
        subject: '',
        category: 'general',
        priority: 'medium',
        message: '',
      });

      // Reload tickets if we're on the tickets tab
      if (activeTab === 'tickets') {
        loadTickets();
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        description: error.response?.data?.message || 'Failed to submit your request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFAQ = faqItems.map(category => ({
    ...category,
    questions: category.questions.filter(
      item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <MainLayout user={user}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Help & Support
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Get help, find answers, and contact our support team.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <nav className="flex space-x-8">
            {[
              { id: 'help', label: 'Help Center', icon: HelpCircle },
              { id: 'contact', label: 'Contact Support', icon: MessageSquare },
              { id: 'tickets', label: 'My Tickets', icon: Mail },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Help Center Tab */}
        {activeTab === 'help' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 text-center">
                <Book className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  Documentation
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Comprehensive guides and API documentation
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Docs
                </Button>
              </div>
              
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 text-center">
                <Video className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  Video Tutorials
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Step-by-step video guides for all features
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Watch Videos
                </Button>
              </div>
              
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 text-center">
                <MessageSquare className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  Community Forum
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Connect with other traders and share strategies
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Join Forum
                </Button>
              </div>
            </div>

            {/* FAQ Search */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input
                  type="text"
                  placeholder="Search FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-6">
                {filteredFAQ.map((category) => (
                  <div key={category.category}>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-3">
                      {category.category}
                    </h3>
                    <div className="space-y-3">
                      {category.questions.map((item, index) => (
                        <details
                          key={index}
                          className="group border border-neutral-200 dark:border-neutral-700 rounded-lg"
                        >
                          <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg">
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">
                              {item.question}
                            </span>
                            <HelpCircle className="w-4 h-4 text-neutral-500 group-open:rotate-180 transition-transform" />
                          </summary>
                          <div className="px-4 pb-4">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {item.answer}
                            </p>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {searchQuery && filteredFAQ.length === 0 && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                  <p className="text-neutral-600 dark:text-neutral-400">
                    No results found for &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500">
                    Try different keywords or contact support for help.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Support Tab */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Form */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                Submit a Support Request
              </h2>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={contactForm.category}
                      onChange={(e) => setContactForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                      disabled={isLoading}
                    >
                      <option value="general">General Question</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing & Account</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      value={contactForm.priority}
                      onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                      disabled={isLoading}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your issue in detail..."
                    rows={6}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white resize-none"
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading || !contactForm.subject || !contactForm.message}
                  className="w-full"
                >
                  Submit Request
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  Other Ways to Reach Us
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        Email Support
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        support@sharetrading.com
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        Phone Support
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        +91 1800-123-4567 (Toll Free)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        Support Hours
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Mon-Fri: 9:00 AM - 6:00 PM IST
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Response Time Expectations
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Urgent: Within 2 hours</li>
                  <li>• High: Within 4 hours</li>
                  <li>• Medium: Within 24 hours</li>
                  <li>• Low: Within 48 hours</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                My Support Tickets
              </h2>
              <Button onClick={() => setActiveTab('contact')}>
                Create New Ticket
              </Button>
            </div>

            {ticketsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-neutral-600 dark:text-neutral-400 mt-2">Loading tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                  No Support Tickets
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  You haven&apos;t created any support tickets yet.
                </p>
                <Button onClick={() => setActiveTab('contact')}>
                  Create Your First Ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                          {ticket.subject}
                        </h3>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          Ticket #{ticket.id} • {ticket.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span>Last updated: {new Date(ticket.lastUpdated || ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}