'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowRight,
    TrendingUp,
    Mail,
    CheckCircle,
    Shield
} from 'lucide-react';
import { Button, Input, useToast } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { forgotPassword, isLoading } = useAuthStore();
    const { addToast } = useToast();

    const validateForm = () => {
        if (!email.trim()) {
            setError('Email is required');
            return false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await forgotPassword(email);
            setIsSubmitted(true);
            addToast({
                type: 'success',
                title: 'Email sent!',
                description: 'Check your inbox for password reset instructions.',
            });
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Failed to send email',
                description: error instanceof Error ? error.message : 'Please try again.',
            });
        }
    };

    const handleInputChange = (value: string) => {
        setEmail(value);
        if (error) setError('');
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-neutral-950">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <Link href="/" className="inline-flex items-center gap-2 mb-12 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">ShareTrading</span>
                    </Link>

                    {!isSubmitted ? (
                        <>
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                                    Forgot password?
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                    No worries, we&apos;ll send you reset instructions
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                        Email address
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        error={error}
                                        disabled={isLoading}
                                        className="h-12 text-base"
                                    />
                                </div>

                                {/* Submit Button */}
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-semibold text-base rounded-xl"
                                        loading={isLoading}
                                        disabled={isLoading}
                                    >
                                        Send reset link
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </motion.div>

                                {/* Back to Login */}
                                <div className="text-center">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to login
                                    </Link>
                                </div>
                            </form>
                        </>
                    ) : (
                        <>
                            {/* Success State */}
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5, type: "spring" }}
                                    className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                                >
                                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                                </motion.div>

                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                    Check your email
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                                    We sent a password reset link to<br />
                                    <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
                                </p>

                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8">
                                    <div className="flex items-start gap-3">
                                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                                Didn&apos;t receive the email?
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Check your spam folder or{' '}
                                                <button
                                                    onClick={() => setIsSubmitted(false)}
                                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                                                >
                                                    try another email address
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Link href="/login">
                                    <Button
                                        className="w-full h-12 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-semibold text-base rounded-xl"
                                    >
                                        <ArrowLeft className="mr-2 h-5 w-5" />
                                        Back to login
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Right Side - Banner */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
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
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8">
                            <Shield className="w-8 h-8 text-blue-300" />
                        </div>

                        <h2 className="text-5xl font-bold mb-6 leading-tight">
                            Secure password
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                recovery
                            </span>
                        </h2>

                        <p className="text-xl text-blue-100 mb-12 max-w-lg">
                            We&apos;ll help you reset your password and get back to trading in no time.
                        </p>

                        <div className="space-y-4">
                            {[
                                'Secure email verification',
                                'Quick password reset process',
                                'Account protection guaranteed'
                            ].map((feature, index) => (
                                <motion.div
                                    key={feature}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                    <span className="text-blue-100">{feature}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
