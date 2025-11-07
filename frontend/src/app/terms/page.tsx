'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Shield, FileText, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ShareTrading</span>
            </Link>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-neutral-900 dark:to-blue-950/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Scale className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Last updated: January 15, 2024
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium">
              <Shield className="w-4 h-4" />
              Your rights and responsibilities
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-12"
          >
            {/* Section 1 */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                1. Acceptance of Terms
              </h2>
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-8 space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  By accessing and using ShareTrading&apos;s services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  These Terms of Service (&quot;Terms&quot;) govern your use of our website located at sharetrading.ai (the &quot;Service&quot;) operated by ShareTrading (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                2. Use License
              </h2>
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-8 space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Permission is granted to temporarily download one copy of the materials on ShareTrading&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained on the website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                3. Trading Services
              </h2>
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-8 space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  ShareTrading provides algorithmic trading tools and services. By using our platform, you acknowledge that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Trading involves substantial risk and may result in financial loss</li>
                  <li>Past performance does not guarantee future results</li>
                  <li>You are responsible for your own trading decisions</li>
                  <li>We provide tools and information, not financial advice</li>
                </ul>
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                4. Account Responsibilities
              </h2>
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-8 space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You agree not to disclose your password to any third party and to take sole responsibility for activities and actions under your password, whether or not you have authorized such activities or actions.
                </p>
              </div>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                5. Privacy Policy
              </h2>
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-8 space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
                </p>
                <Link 
                  href="/privacy"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                >
                  Read our Privacy Policy
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                6. Termination
              </h2>
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-8 space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  If you wish to terminate your account, you may simply discontinue using the Service.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                7. Contact Information
              </h2>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p>Email: legal@sharetrading.ai</p>
                  <p>Address: 123 Trading Street, Financial District, NY 10001</p>
                  <p>Phone: +1 (555) 123-4567</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50 dark:bg-neutral-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to start trading?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Join thousands of traders using our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Get Started Free
                </motion.button>
              </Link>
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl font-semibold hover:border-gray-900 dark:hover:border-white transition-colors"
                >
                  Learn More
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
