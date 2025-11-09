'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  Brain,
  BarChart3,
  Target,
  Sparkles,
  Check
} from 'lucide-react';
import { Button, Input, useToast } from '@/components/ui';
import { PhoneNumberInput } from '@/components/ui/phone-input';
import { CountrySelect } from '@/components/ui/country-select';
import { useAuthStore } from '@/stores/auth-store';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signUp, isLoading } = useAuthStore();
  const { addToast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
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

    if (!formData.phone || formData.phone.trim().length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Generate username from email
      const username = formData.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      await signUp(formData.name, formData.email, username, formData.password, formData.phone, formData.country);
      
      addToast({
        type: 'success',
        title: 'Account created!',
        description: 'Welcome to ShareTrading. Let\'s get you started.',
      });
      
      // Small delay to ensure auth state is updated before navigation
      setTimeout(() => {
        console.log('Redirecting to:', redirectUrl);
        router.push(redirectUrl);
      }, 100);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Registration failed',
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

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Banner */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-medium">Join 50,000+ successful traders</span>
            </div>

            {/* Headline */}
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Start your trading
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                journey today
              </span>
            </h2>

            <p className="text-xl text-blue-100 mb-12 max-w-lg">
              Create your account and get instant access to professional-grade trading tools.
            </p>

            {/* Features */}
            <div className="space-y-6">
              {[
                {
                  icon: Brain,
                  title: 'AI-Powered Strategies',
                  description: 'Build sophisticated algorithms with our AI assistant'
                },
                {
                  icon: BarChart3,
                  title: 'Advanced Backtesting',
                  description: 'Test against 10+ years of historical data'
                },
                {
                  icon: Target,
                  title: 'Risk Management',
                  description: 'Advanced position sizing and stop-loss automation'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-blue-200">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Benefits */}
            <div className="mt-12 space-y-3">
              {[
                'Free 14-day trial',
                'No credit card required',
                'Cancel anytime'
              ].map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 text-blue-100"
                >
                  <Check className="w-5 h-5 text-green-400" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-neutral-950 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md my-8"
        >
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">ShareTrading</span>
          </Link>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
              Create account
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Start your free trial today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
                Full name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={errors.name}
                disabled={isLoading}
                className="h-11 text-base"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
                Email address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                disabled={isLoading}
                className="h-11 text-base"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
                Phone number <span className="text-red-500">*</span>
              </label>
              <PhoneNumberInput
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value || '')}
                placeholder="Enter your phone number"
                error={errors.phone}
                disabled={isLoading}
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
                Country
              </label>
              <CountrySelect
                value={formData.country}
                onChange={(value) => handleInputChange('country', value)}
                placeholder="Select your country"
                error={errors.country}
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={errors.password}
                  className="h-11 text-base pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 6 characters
              </p>
            </div>

            {/* Terms & Conditions */}
            <div>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.terms}</p>
              )}
            </div>

            {/* Submit Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-2">
              <Button
                type="submit"
                className="w-full h-11 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-semibold text-base rounded-xl"
                loading={isLoading}
                disabled={isLoading}
              >
                Create account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            {/* Sign In Link */}
            <div className="text-center pt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
              </span>
              <Link
                href="/login"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign in
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
