import { apiClient } from './client';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  company?: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    email: string;
    subject: string;
    status: string;
    createdAt: string;
  };
  errors?: Array<{
    msg: string;
    param: string;
  }>;
}

class ContactAPI {
  async submitContactForm(data: ContactFormData): Promise<ContactResponse> {
    try {
      console.log('Making API request to:', `${process.env.NEXT_PUBLIC_API_URL}/contact`);
      console.log('Request data:', data);
      
      const response = await apiClient.post('/contact', data);
      console.log('Raw API response:', response);
      
      // The interceptor modifies the response, so we need to handle both cases
      const responseData = response.data;
      
      // If the response has a success property, return it as is
      if (typeof responseData === 'object' && 'success' in responseData) {
        return responseData as ContactResponse;
      }
      
      // Otherwise, wrap it in a success response
      return {
        success: true,
        message: 'Contact form submitted successfully',
        data: responseData
      };
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      // Handle axios error response
      if (error.response?.data) {
        const errorData = error.response.data;
        return {
          success: false,
          message: errorData.message || 'Failed to submit contact form',
          errors: errorData.errors
        };
      }
      
      // Handle network or other errors
      return {
        success: false,
        message: error.message || 'Network error. Please check if the backend server is running.'
      };
    }
  }
}

export const contactAPI = new ContactAPI();
