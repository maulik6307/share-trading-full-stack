'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { modalVariants } from '@/lib/animations';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

type ForgotPasswordStep = 'email' | 'success';

export function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  const { forgotPassword, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await forgotPassword(email);
      setStep('success');
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email');
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setError('');
    onClose();
  };

  const handleBackToLogin = () => {
    handleClose();
    onBackToLogin();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.div
              key="email-step"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                  Forgot Password?
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  No worries! Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={error}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToLogin}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                  <Button
                    type="submit"
                    loading={isLoading}
                    className="flex-1"
                  >
                    Send Reset Link
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success-step"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6 text-center"
            >
              {/* Success Icon */}
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>

              {/* Success Message */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Check Your Email
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  We've sent a password reset link to
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                  {email}
                </p>
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleBackToLogin}
                  className="w-full"
                >
                  Back to Login
                </Button>
                <button
                  onClick={() => setStep('email')}
                  className="w-full text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Try a different email
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}