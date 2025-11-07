import { apiClient } from './client';

// Remove demo mode checks - let all API calls go through to backend

// Types
export interface SupportTicket {
  id: string;
  ticketId: string;
  subject: string;
  message: string;
  category: 'general' | 'technical' | 'billing' | 'bug' | 'feature';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: Date;
  lastUpdated: Date;
  responses: Array<{
    message: string;
    author: {
      name: string;
      email: string;
      role: string;
    };
    authorType: 'user' | 'support' | 'admin';
    timestamp: Date;
  }>;
}

export interface CreateTicketData {
  subject: string;
  message: string;
  category: 'general' | 'technical' | 'billing' | 'bug' | 'feature';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface FAQCategory {
  category: string;
  questions: FAQItem[];
}

export interface TicketStats {
  open?: number;
  'in-progress'?: number;
  resolved?: number;
  closed?: number;
}

// Support API
export const supportAPI = {
  // Get user's tickets
  getTickets: async (params?: {
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/support/tickets', { params });
    return response.data;
  },

  // Get single ticket
  getTicket: async (ticketId: string) => {
    const response = await apiClient.get(`/support/tickets/${ticketId}`);
    return response.data;
  },

  // Create new ticket
  createTicket: async (data: CreateTicketData) => {
    const response = await apiClient.post('/support/tickets', data);
    return response.data;
  },

  // Add response to ticket
  addResponse: async (ticketId: string, message: string) => {
    const response = await apiClient.post(`/support/tickets/${ticketId}/responses`, { message });
    return response.data;
  },

  // Close ticket
  closeTicket: async (ticketId: string) => {
    const response = await apiClient.put(`/support/tickets/${ticketId}/close`);
    return response.data;
  },

  // Rate ticket
  rateTicket: async (ticketId: string, rating: number, feedback?: string) => {
    const response = await apiClient.put(`/support/tickets/${ticketId}/rate`, { rating, feedback });
    return response.data;
  },

  // Get ticket statistics
  getStats: async () => {
    const response = await apiClient.get('/support/stats');
    return response.data;
  },

  // Get FAQ
  getFAQ: async (params?: { search?: string; category?: string }) => {
    const response = await apiClient.get('/support/faq', { params });
    return response.data;
  },
};