'use client';

import { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

import CountUp from 'react-countup';
import { 
  TrendingUp, 
  BarChart3, 
  Shield, 
  Zap, 
  Target, 
  Brain,
  ArrowRight,
  CheckCircle,
  Play,
  Star,
  Users,
  Globe,
  Award,
  Smartphone,
  Monitor,
  Code,
  PieChart,
  Activity,
  Lock,
  Headphones,
  Clock,

  ChevronRight,
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui';
import { SplitAuthScreen } from '@/components/features/auth';
import { Footer } from './footer';
import { LandingHeader } from './landing-header';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function EnhancedLandingPage({ onGetStarted }: LandingPageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Strategy Builder',
      description: 'Create sophisticated trading strategies with our AI-powered visual builder and advanced code editor.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Backtesting Engine',
      description: 'Test strategies against 10+ years of historical data with institutional-grade analytics.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Risk-Free Paper Trading',
      description: 'Deploy strategies in real-time simulation with zero financial risk and realistic execution.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Zap,
      title: 'Real-Time Market Data',
      description: 'Access live market feeds with millisecond precision and comprehensive market coverage.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Target,
      title: 'Precision Risk Management',
      description: 'Advanced position sizing, stop-loss automation, and portfolio risk analytics.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: TrendingUp,
      title: 'Performance Analytics',
      description: 'Detailed reports with Sharpe ratios, drawdown analysis, and trade attribution.',
      color: 'from-indigo-500 to-purple-500'
    },
  ];

  const stats = [
    { number: 50000, suffix: '+', label: 'Active Traders', icon: Users },
    { number: 2.5, suffix: 'M+', label: 'Strategies Created', icon: Code },
    { number: 99.9, suffix: '%', label: 'Uptime Guarantee', icon: Activity },
    { number: 150, suffix: '+', label: 'Countries Served', icon: Globe },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Quantitative Analyst',
      company: 'Goldman Sachs',
      image: '/api/placeholder/64/64',
      content: '                  &quot;ShareTrading transformed how I develop and test strategies. The backtesting engine is incredibly sophisticated.&quot;',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Portfolio Manager',
      company: 'BlackRock',
      image: '/api/placeholder/64/64',
      content: 'The AI-powered insights have helped me identify patterns I would have missed. Exceptional platform.',
      rating: 5
    },
    {
      name: 'Emily Johnson',
      role: 'Independent Trader',
      company: 'Freelance',
      image: '/api/placeholder/64/64',
      content: 'As a beginner, the visual strategy builder made algorithmic trading accessible. Highly recommend!',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 0,
      period: 'month',
      description: 'Perfect for beginners learning algorithmic trading',
      features: [
        '5 Active Strategies',
        'Basic Backtesting',
        'Paper Trading',
        'Community Support',
        'Mobile App Access'
      ],
      popular: false,
      cta: 'Start Free'
    },
    {
      name: 'Professional',
      price: 49,
      period: 'month',
      description: 'Advanced tools for serious traders and analysts',
      features: [
        'Unlimited Strategies',
        'Advanced Backtesting',
        'Real-time Data Feeds',
        'Priority Support',
        'API Access',
        'Custom Indicators',
        'Portfolio Analytics'
      ],
      popular: true,
      cta: 'Start Trial'
    },
    {
      name: 'Enterprise',
      price: 199,
      period: 'month',
      description: 'Full-featured solution for institutions',
      features: [
        'Everything in Professional',
        'White-label Solution',
        'Dedicated Support',
        'Custom Integrations',
        'Advanced Security',
        'Team Management',
        'SLA Guarantee'
      ],
      popular: false,
      cta: 'Contact Sales'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 overflow-hidden font-professional">
      {/* Header */}
      <LandingHeader 
        onGetStarted={onGetStarted}
        onShowAuth={() => setShowAuthModal(true)}
      />
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 pt-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-neutral-900 dark:via-blue-900/20 dark:to-indigo-900/20">
        <motion.div style={{ y }} className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-pink-400/20 rounded-full blur-2xl animate-pulse delay-2000" />
        </motion.div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-8"
            >
              <Star className="w-4 h-4 mr-2" />
              Trusted by 50,000+ traders worldwide
            </motion.div>

            <h1 className="font-professional-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-gray-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
              The Future of
              <motion.span
                className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                style={{
                  backgroundSize: '200% 200%',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              >
                Algorithmic Trading
              </motion.span>
            </h1>

            <p className="font-professional-medium text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Build, backtest, and deploy sophisticated trading strategies with our AI-powered platform. 
              <span className="text-gray-900 dark:text-white font-semibold"> No coding required</span>, institutional-grade results guaranteed.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
            >
              <Button
                size="lg"
                onClick={() => setShowAuthModal(true)}
                className="text-lg font-semibold px-8 sm:px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl rounded-xl"
              >
                Start Trading Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onGetStarted}
                className="text-lg font-semibold px-8 sm:px-10 py-4 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transform hover:scale-105 transition-all duration-200 rounded-xl"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 sm:mt-16"
            >
              <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-20 blur-sm"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-20 blur-sm"
        />
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-neutral-800 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="font-professional-bold text-3xl sm:text-4xl text-gray-900 dark:text-white mb-2">
                  <CountUp
                    end={stat.number}
                    duration={2.5}
                    delay={index * 0.2}
                    suffix={stat.suffix}
                    enableScrollSpy
                    scrollSpyOnce
                  />
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16 sm:mb-20"
          >
            <h2 className="font-professional-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-6 tracking-tight">
              Powerful Features for Every Trader
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium">
              From beginners to professionals, our platform provides everything you need to succeed in algorithmic trading.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.2 }
                }}
                className="group relative p-6 sm:p-8 bg-white dark:bg-neutral-800 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`} />
                
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 tracking-tight">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  {feature.description}
                </p>

                <motion.div
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  <ChevronRight className="w-6 h-6 text-blue-500" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Product Demo Section */}
      <section className="py-24 bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-8">
                See ShareTrading in Action
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Watch how our platform transforms complex trading strategies into simple, visual workflows. 
                No coding experience required.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: Monitor, text: 'Drag-and-drop strategy builder' },
                  { icon: BarChart3, text: 'Real-time backtesting results' },
                  { icon: Smartphone, text: 'Mobile-first responsive design' },
                  { icon: Lock, text: 'Bank-level security & encryption' }
                ].map((item, index) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center"
                  >
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mr-4">
                      <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-lg text-gray-700 dark:text-gray-300">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <Button
                size="lg"
                onClick={onGetStarted}
                className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Full Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="ml-4 text-gray-400 text-sm">ShareTrading Platform</div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-400 text-sm font-mono">Portfolio Performance</span>
                      <span className="text-green-400 font-bold">+24.7%</span>
                    </div>
                    <div className="h-20 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded flex items-end justify-center">
                      <TrendingUp className="w-8 h-8 text-green-400" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <PieChart className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <div className="text-white font-bold">12</div>
                      <div className="text-gray-400 text-xs">Active Strategies</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <div className="text-white font-bold">1.8</div>
                      <div className="text-gray-400 text-xs">Sharpe Ratio</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements around the demo */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-80 flex items-center justify-center"
              >
                <Brain className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl opacity-80 flex items-center justify-center"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16 sm:mb-20"
          >
            <h2 className="font-professional-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-6 tracking-tight">
              Trusted by Industry Leaders
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium">
              See what professional traders and institutions are saying about ShareTrading.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.name}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <Quote className="w-8 h-8 text-blue-500 mb-4" />
                
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  &quot;{testimonial.content}&quot;
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Choose Your Trading Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Start free and scale as you grow. All plans include our core features with no hidden fees.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {pricingPlans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`relative bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                  plan.popular 
                    ? 'border-blue-500 ring-4 ring-blue-500/20' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      /{plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  onClick={() => setShowAuthModal(true)}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                  }`}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"
        />

        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-8">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              Join thousands of traders who have already discovered the power of AI-driven algorithmic trading. 
              Start your free trial today and see the difference.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                onClick={() => setShowAuthModal(true)}
                className="text-lg px-10 py-4 bg-white text-blue-600 hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onGetStarted}
                className="text-lg px-10 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-200"
              >
                <Headphones className="mr-2 h-5 w-5" />
                Talk to Sales
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center space-x-8 text-white/80">
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Split Auth Screen */}
      <SplitAuthScreen
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          onGetStarted();
        }}
      />
    </div>
  );
}