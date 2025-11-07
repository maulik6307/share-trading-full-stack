'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
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
  Play,
  Star,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Code,
  PieChart,
  Activity,
  Lock,
  ChevronRight,
  Sparkles,
  LineChart,
  Layers,
  Rocket,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Footer } from './footer';
import { LandingHeader } from './landing-header';
import Link from 'next/link';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function EnhancedLandingPage({ onGetStarted }: LandingPageProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  // Mouse follower effect - throttled for performance
  useEffect(() => {
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Show scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // Memoize heavy computations
  const memoizedStats = useMemo(() => stats, []);
  const memoizedFeatures = useMemo(() => features, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 overflow-hidden font-professional">
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Custom cursor follower - only on desktop */}
      <motion.div
        className="hidden lg:block fixed w-6 h-6 rounded-full border-2 border-blue-500 pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 200,
          mass: 0.5
        }}
      />

      {/* Header */}
      <LandingHeader
        onGetStarted={onGetStarted}
      />
      {/* Hero Section - Modern Bold Design */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20 overflow-hidden bg-white dark:bg-neutral-950">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/30" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

        {/* Gradient orbs */}
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-full shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Trusted by 50,000+ traders worldwide
              </span>
            </motion.div>

            {/* Main Headline - Bold & Minimal */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold text-gray-900 dark:text-white mb-8 leading-[0.95] tracking-tighter">
              Trade smarter.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_auto] animate-gradient">
                Win bigger.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-600 dark:text-gray-400 mb-12 max-w-4xl mx-auto font-light leading-relaxed">
              AI-powered algorithmic trading platform.
              <br className="hidden sm:block" />
              <span className="text-gray-900 dark:text-white font-medium">No code. No limits.</span>
            </p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <Link href="/signup">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    className="group relative px-8 py-6 text-lg font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
                  >
                    <motion.span
                      className="relative z-10 flex items-center"
                      whileHover={{ x: -2 }}
                    >
                      Start free trial
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </motion.div>
                    </motion.span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </motion.div>
              </Link>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onGetStarted}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="group px-8 py-6 text-lg font-semibold border-2 border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white rounded-2xl transition-all duration-300"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block mr-2"
                  >
                    <Play className="h-5 w-5" />
                  </motion.div>
                  Watch demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-500"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Product preview - Floating dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-20 relative"
          >
            <div className="relative mx-auto max-w-6xl">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />

              {/* Dashboard mockup */}
              <div className="relative bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-neutral-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-white dark:bg-neutral-900 rounded-lg text-xs text-gray-500">
                      sharetrading.ai/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-neutral-900 dark:to-neutral-800">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Portfolio Value</span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">$124,563</div>
                      <div className="text-xs text-green-500">+12.4%</div>
                    </div>
                    <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Active Strategies</span>
                        <Brain className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">8</div>
                      <div className="text-xs text-gray-500">Running</div>
                    </div>
                    <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Win Rate</span>
                        <Target className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">68.5%</div>
                      <div className="text-xs text-purple-500">+2.1%</div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="h-32 flex items-end justify-between gap-2">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
                          className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-8 -left-8 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-xl flex items-center justify-center"
              >
                <Rocket className="w-10 h-10 text-white" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-8 -right-8 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-xl flex items-center justify-center"
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section - Minimal & Bold */}
      <section className="py-24 bg-gray-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16"
          >
            {memoizedStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center group cursor-pointer"
              >
                <motion.div
                  className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight"
                  whileHover={{ scale: 1.1 }}
                >
                  <CountUp
                    end={stat.number}
                    duration={2.5}
                    delay={index * 0.2}
                    suffix={stat.suffix}
                    enableScrollSpy
                    scrollSpyOnce
                  />
                </motion.div>
                <div className="text-gray-600 dark:text-gray-400 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Modern Grid */}
      <section id="features" className="py-32 bg-white dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Everything you need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Professional-grade tools designed for traders of all levels
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memoizedFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -8, scale: 1.02 }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="group relative p-8 bg-gray-50 dark:bg-neutral-900 rounded-3xl hover:bg-white dark:hover:bg-neutral-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-all duration-300 hover:shadow-xl cursor-pointer"
              >
                <motion.div
                  className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6`}
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                <motion.div
                  className="absolute top-8 right-8"
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight className="w-5 h-5 text-blue-500" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Clean & Simple */}
      <section className="py-32 bg-gray-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              How it works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Start trading in minutes, not months
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Build your strategy',
                description: 'Use our visual builder or code editor to create sophisticated trading algorithms',
                icon: Layers
              },
              {
                step: '02',
                title: 'Backtest & optimize',
                description: 'Test against years of historical data and refine your approach with AI insights',
                icon: LineChart
              },
              {
                step: '03',
                title: 'Deploy & profit',
                description: 'Launch your strategy in paper trading or live markets with one click',
                icon: Rocket
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-7xl font-bold text-gray-200 dark:text-gray-800 mb-4">
                  {item.step}
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Section - NEW */}
      <section className="py-32 bg-white dark:bg-neutral-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Watch it in action
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Real-time trading simulation powered by AI
            </p>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            {/* Interactive Trading Dashboard */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-800"
            >
              {/* Terminal Header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center text-sm text-gray-400">
                  Live Trading Simulation
                </div>
              </div>

              {/* Live Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Portfolio', value: '$124,563', change: '+12.4%', positive: true },
                  { label: 'Win Rate', value: '68.5%', change: '+2.1%', positive: true },
                  { label: 'Active', value: '8', change: 'strategies', positive: null }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition-all cursor-pointer"
                  >
                    <div className="text-xs text-gray-400 mb-1">{stat.label}</div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className={`text-xs ${stat.positive === true ? 'text-green-400' : stat.positive === false ? 'text-red-400' : 'text-gray-400'}`}>
                      {stat.change}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Animated Chart */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">Performance (30d)</span>
                  <div className="flex gap-2">
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-green-500"
                    />
                    <span className="text-xs text-gray-400">Live</span>
                  </div>
                </div>
                <div className="h-40 flex items-end justify-between gap-1">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const height = 40 + Math.sin(i / 3) * 30 + Math.random() * 20;
                    return (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        transition={{ duration: 0.5, delay: i * 0.02 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.1, backgroundColor: '#3b82f6' }}
                        className="flex-1 bg-gradient-to-t from-blue-500/50 to-purple-500/50 rounded-t cursor-pointer"
                      />
                    );
                  })}
                </div>
              </div>

              {/* Live Activity Feed */}
              <div className="mt-6 space-y-2">
                {[
                  { action: 'BUY', symbol: 'AAPL', price: '$175.50', time: '2s ago', color: 'green' },
                  { action: 'SELL', symbol: 'TSLA', price: '$242.80', time: '5s ago', color: 'red' },
                  { action: 'BUY', symbol: 'MSFT', price: '$378.90', time: '8s ago', color: 'green' }
                ].map((trade, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3 border border-gray-700/50 hover:border-gray-600 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`px-2 py-1 rounded text-xs font-bold ${trade.color === 'green' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {trade.action}
                      </div>
                      <span className="text-white font-semibold">{trade.symbol}</span>
                      <span className="text-gray-400">{trade.price}</span>
                    </div>
                    <span className="text-xs text-gray-500">{trade.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Floating Action Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4"
            >
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold shadow-xl flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Try it now
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Demo Section */}
      <section className="py-24 bg-white dark:bg-neutral-950">
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

      {/* Testimonials Section - Minimal Cards */}
      <section id="testimonials" className="py-32 bg-gray-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Loved by traders
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Join thousands of successful traders
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-neutral-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed text-lg">
                  {testimonial.content}
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Clean & Modern */}
      <section id="pricing" className="py-32 bg-white dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
              Simple pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Start free, upgrade when you&apos;re ready
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-3xl p-8 ${plan.popular
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-2xl scale-105'
                  : 'bg-gray-50 dark:bg-neutral-900'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Popular
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold">
                      ${plan.price}
                    </span>
                    <span className={plan.popular ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500'}>
                      /month
                    </span>
                  </div>
                  <p className={plan.popular ? 'text-gray-300 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-green-400' : 'text-green-500'}`} />
                      <span className={plan.popular ? 'text-gray-200 dark:text-gray-700' : 'text-gray-700 dark:text-gray-300'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup" className="block">
                  <Button
                    size="lg"
                    className={`w-full rounded-xl ${plan.popular
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                      : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                      }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Bold & Minimal */}
      <section className="py-32 bg-gray-900 dark:bg-white relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl lg:text-7xl font-bold text-white dark:text-gray-900 mb-8 tracking-tight">
              Start trading today
            </h2>
            <p className="text-xl text-gray-300 dark:text-gray-600 mb-12 max-w-2xl mx-auto">
              Join thousands of traders using AI to make smarter decisions
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="px-10 py-6 text-lg font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl shadow-xl"
                >
                  Get started free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={onGetStarted}
                className="px-10 py-6 text-lg font-semibold border-2 border-white/20 dark:border-gray-900/20 text-white dark:text-gray-900 hover:bg-white/10 dark:hover:bg-gray-900/10 rounded-2xl"
              >
                Book a demo
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400 dark:text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: showScrollTop ? 1 : 0,
          scale: showScrollTop ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        onClick={scrollToTop}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronRight className="w-6 h-6 transform -rotate-90" />
        </motion.div>
      </motion.button>
    </div>
  );
}