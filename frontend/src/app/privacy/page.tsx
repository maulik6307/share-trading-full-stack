'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Shield, Lock, Eye, Database } from 'lucide-react';

export default function PrivacyPage() {
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
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Last updated: January 15, 2024
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-300 text-sm font-medium">
              <Lock className="w-4 h-4" />
              Your privacy is protected
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
                <Eye className="w-8 h-8 text-blue-600" />
                1. Information We Collect
              </h2>
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-8 space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
                </p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Personal Information:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Account credentials and authentication information</li>
                  <li>Trading preferences and settings</li>
                  <li>Payment and billing information</li>
                  <li>Communication history with our support team</li>
                </ul>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-600" />
                2. How We Use Your Information
              </h2>
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-8 space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Provide and operate our trading platform</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Analyze usage patterns to improve our services</li>
                  <li>Detect and prevent fraud and abuse</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                3. Information Sharing
              </h2>
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-8 space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>With trusted service providers who assist our operations</li>
                  <li>In connection with a business transfer or merger</li>
                </ul>
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                4. Data Security
              </h2>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-2xl p-8 border border-green-200 dark:border-green-800">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  We implement appropriate security measures to protect your personal information:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/50 dark:bg-neutral-900/50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Encryption</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">All data is encrypted in transit and at rest</p>
                  </div>
                  <div className="bg-white/50 dark:bg-neutral-900/50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Access Control</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Strict access controls and authentication</p>
                  </div>
                  <div className="bg-white/50 dark:bg-neutral-900/50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Monitoring</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">24/7 security monitoring and alerts</p>
                  </div>
                  <div className="bg-white/50 dark:bg-neutral-900/50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Compliance</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">SOC 2 and industry standard compliance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                5. Your Rights
              </h2>
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-8 space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You have certain rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                </ul>
              </div>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                6. Cookies and Tracking
              </h2>
              <div className="bg-gray-50 dark:bg-neutral-900 rounded-2xl p-8 space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Essential cookies for platform functionality</li>
                  <li>Analytics cookies to understand usage patterns</li>
                  <li>Preference cookies to remember your settings</li>
                  <li>Security cookies to protect against fraud</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You can control cookie preferences through your browser settings.
                </p>
              </div>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                7. Contact Us
              </h2>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p>Email: privacy@sharetrading.ai</p>
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
              Your privacy matters to us
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Trade with confidence knowing your data is secure
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Start Trading Securely
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
