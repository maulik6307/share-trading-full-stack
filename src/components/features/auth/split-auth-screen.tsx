'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  TrendingUp,
  BarChart3,
  Shield,
  CheckCircle,
  X
} from 'lucide-react';
import { Button, Input, useToast } from '@/components/ui';
import { PhoneNumberInput } from '@/components/ui/phone-input';
import { CountrySelect } from '@/components/ui/country-select';
import { ForgotPasswordModal } from './forgot-password-modal';
import { useAuthStore } from '@/stores/auth-store';

interface SplitAuthScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'signin' | 'signup';
}

type AuthMode = 'signin' | 'signup';

export function SplitAuthScreen({ isOpen, onClose, onSuccess, initialMode = 'signin' }: SplitAuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, isLoading } = useAuthStore();
  const { addToast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (mode === 'signup') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!formData.phone || formData.phone.trim().length < 10) {
        newErrors.phone = 'Please enter a valid phone number';
      }
      if (!formData.agreeToTerms) {
        newErrors.terms = 'You must agree to the terms and conditions';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (mode === 'signin') {
        await signIn(formData.email, formData.password);
        addToast({
          type: 'success',
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
      } else {
        // Generate username from email
        const username = formData.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        await signUp(formData.name, formData.email, username, formData.password, formData.phone, formData.country);
        addToast({
          type: 'success',
          title: 'Account created!',
          description: 'Welcome to ShareTrading. Let\'s get you started.',
        });
      }

      onSuccess();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Authentication failed',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setErrors({});
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      country: '',
      agreeToTerms: false
    });
  };

  const bannerFeatures = [
    {
      icon: TrendingUp,
      title: 'AI-Powered Strategies',
      description: 'Build sophisticated trading algorithms with our AI assistant'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive backtesting and performance analysis'
    },
    {
      icon: Shield,
      title: 'Risk-Free Trading',
      description: 'Paper trading with real market conditions'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-6xl mx-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Side - Form */}
          <div className="flex-1 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              {/* Mobile Banner */}
              <div className="lg:hidden text-center mb-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 mx-auto">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-professional-bold text-lg mb-1">ShareTrading</h3>
                <p className="text-sm text-blue-100">AI-Powered Trading Platform</p>
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="font-professional-bold text-3xl text-gray-900 dark:text-white mb-2">
                  {mode === 'signin' ? 'Login' : 'Signup'}
                </h1>
                <p className="font-professional text-gray-600 dark:text-gray-400">
                  {mode === 'signin'
                    ? 'Enter your email or username below to login to your account'
                    : 'Enter your details below to Signup'
                  }
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: mode === 'signin' ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mode === 'signin' ? 20 : -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {mode === 'signup' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            error={errors.name}
                            disabled={isLoading}
                            className="bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="email"
                            placeholder="m@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            error={errors.email}
                            disabled={isLoading}
                            className="bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700"
                          />
                        </div>
                      </div>
                    )}

                    {mode === 'signin' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Username/Email
                        </label>
                        <Input
                          type="email"
                          placeholder="Enter your email or username"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          error={errors.email}
                          disabled={isLoading}
                          className="bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700"
                        />
                      </div>
                    )}

                    {mode === 'signup' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Username <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter your username"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            disabled={isLoading}
                            className="bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone
                          </label>
                          <PhoneNumberInput
                            value={formData.phone}
                            onChange={(value) => handleInputChange('phone', value || '')}
                            placeholder="Enter your phone number"
                            error={errors.phone}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    )}

                    <div className={mode === 'signup' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder={mode === 'signin' ? 'Enter your password' : 'Enter your password'}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            error={errors.password}
                            className="bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 pr-10"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            disabled={isLoading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {mode === 'signin' && (
                          <div className="text-right">
                            <button
                              type="button"
                              onClick={() => setShowForgotPassword(true)}
                              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                              disabled={isLoading}
                            >
                              Forgot password?
                            </button>
                          </div>
                        )}
                      </div>

                      {mode === 'signup' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <CountrySelect
                            value={formData.country}
                            onChange={(value) => handleInputChange('country', value)}
                            placeholder="Select your country"
                            error={errors.country}
                            disabled={isLoading}
                          />
                        </div>
                      )}
                    </div>

                    {mode === 'signup' && (
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={formData.agreeToTerms}
                          onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                          className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                          I agree with{' '}
                          <button type="button" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 underline">
                            Terms & Condition
                          </button>
                          {' '}and{' '}
                          <button type="button" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 underline">
                            Privacy Policy
                          </button>
                        </label>
                      </div>
                    )}
                    {errors.terms && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.terms}</p>
                    )}
                  </motion.div>
                </AnimatePresence>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {mode === 'signin' ? 'Login' : 'Signup'}
                </Button>

                <div className="text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {mode === 'signin' ? "Don&apos;t have an account? " : 'Have an account? '}
                  </span>
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                    disabled={isLoading}
                  >
                    {mode === 'signin' ? 'Signup' : 'Login'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Banner */}
          <div className="flex-1 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden lg:flex hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 text-white">
              {/* Logo */}
              <div className="mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-professional-bold text-2xl mb-2">ShareTrading</h2>
                <p className="text-blue-200 font-professional">
                  {mode === 'signin' ? 'ShareTrading Admin Dashboard' : 'ShareTrading Admin Dashboard'}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-6 max-w-sm">
                {bannerFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start space-x-4 text-left"
                  >
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="font-professional-medium text-white mb-1">{feature.title}</h3>
                      <p className="text-sm text-blue-200 font-professional">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex items-center space-x-6 text-blue-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-professional">Secure & Encrypted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-professional">50K+ Users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => {
          setShowForgotPassword(false);
          // Keep the main auth modal open and in signin mode
          setMode('signin');
        }}
      />
    </div>
  );
}