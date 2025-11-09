import { useState } from 'react';
import { contactAPI, ContactFormData, ContactResponse } from '@/lib/api/contact';
import { useToast } from '@/components/ui/toast';

interface UseContactFormReturn {
  isSubmitting: boolean;
  submitContactForm: (data: ContactFormData) => Promise<boolean>;
  error: string | null;
  success: boolean;
}

export function useContactForm(): UseContactFormReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { addToast } = useToast();

  const submitContactForm = async (data: ContactFormData): Promise<boolean> => {
    console.log('Submitting contact form with data:', data);
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response: ContactResponse = await contactAPI.submitContactForm(data);
      console.log('Contact form response:', response);

      if (response.success) {
        setSuccess(true);
        addToast({
          type: 'success',
          title: 'Message Sent!',
          description: response.message || 'Thank you for contacting us. We\'ll get back to you soon!',
        });
        return true;
      } else {
        // Handle validation errors
        if (response.errors && response.errors.length > 0) {
          const errorMessages = response.errors.map(err => err.msg).join(', ');
          setError(errorMessages);
        } else {
          setError(response.message || 'Failed to send message');
        }
        
        addToast({
          type: 'error',
          title: 'Failed to Send Message',
          description: response.message || 'Please check your information and try again.',
        });
        return false;
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      
      addToast({
        type: 'error',
        title: 'Error',
        description: errorMessage,
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitContactForm,
    error,
    success
  };
}
