'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { Button, useToast } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { CreditCard, Download, Calendar, DollarSign, CheckCircle, AlertTriangle, Clock, Zap } from 'lucide-react';

interface BillingInfo {
  plan: {
    name: string;
    price: number;
    interval: 'monthly' | 'yearly';
    features: string[];
    status: 'active' | 'cancelled' | 'trial';
    trialEndsAt?: Date;
    nextBillingDate?: Date;
  };
  paymentMethod: {
    type: 'card' | 'bank';
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  } | null;
  billingHistory: {
    id: string;
    date: Date;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    description: string;
    invoiceUrl?: string;
  }[];
  usage: {
    backtests: { used: number; limit: number };
    strategies: { used: number; limit: number };
    paperTrades: { used: number; limit: number };
    dataFeeds: { used: number; limit: number };
  };
}

export default function BillingPage() {
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    plan: {
      name: 'Free Trial',
      price: 0,
      interval: 'monthly',
      features: [
        '5 Backtests per month',
        '3 Active strategies',
        'Basic paper trading',
        'Community support',
        'Standard data feeds',
      ],
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    paymentMethod: null,
    billingHistory: [
      {
        id: 'inv-001',
        date: new Date('2024-01-01'),
        amount: 0,
        status: 'paid',
        description: 'Free Trial - No charge',
      },
    ],
    usage: {
      backtests: { used: 2, limit: 5 },
      strategies: { used: 1, limit: 3 },
      paperTrades: { used: 1, limit: 1 },
      dataFeeds: { used: 1, limit: 1 },
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load billing information on component mount
  React.useEffect(() => {
    const loadBillingInfo = async () => {
      try {
        const { billingAPI } = await import('@/lib/api/settings');
        const response = await billingAPI.getBillingInfo();
        
        if (response.data) {
          setBillingInfo(response.data);
        }
      } catch (error) {
        console.error('Failed to load billing information:', error);
        addToast({
          type: 'error',
          title: 'Load Failed',
          description: 'Failed to load billing information. Using defaults.',
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadBillingInfo();
  }, []); // Empty dependency array - only run once on mount

  const plans = [
    {
      name: 'Starter',
      price: 29,
      interval: 'monthly' as const,
      yearlyPrice: 290,
      features: [
        '50 Backtests per month',
        '10 Active strategies',
        'Advanced paper trading',
        'Email support',
        'Real-time data feeds',
        'Basic analytics',
      ],
      popular: false,
    },
    {
      name: 'Professional',
      price: 99,
      interval: 'monthly' as const,
      yearlyPrice: 990,
      features: [
        'Unlimited backtests',
        'Unlimited strategies',
        'Live trading integration',
        'Priority support',
        'Premium data feeds',
        'Advanced analytics',
        'Custom indicators',
        'API access',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 299,
      interval: 'monthly' as const,
      yearlyPrice: 2990,
      features: [
        'Everything in Professional',
        'White-label solution',
        'Dedicated support',
        'Custom integrations',
        'Advanced risk management',
        'Multi-user accounts',
        'SLA guarantee',
      ],
      popular: false,
    },
  ];

  const handleUpgrade = async (planName: string) => {
    setIsLoading(true);
    
    try {
      const { billingAPI } = await import('@/lib/api/settings');
      
      await billingAPI.upgradePlan(planName);
      
      addToast({
        type: 'success',
        title: 'Upgrade Initiated',
        description: `Upgrade to ${planName} plan has been initiated. You will receive a confirmation email shortly.`,
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Upgrade Failed',
        description: error.response?.data?.message || 'Failed to initiate upgrade. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    addToast({
      type: 'info',
      title: 'Download Started',
      description: 'Invoice download will begin shortly.',
    });
  };

  const handleUpdatePaymentMethod = () => {
    addToast({
      type: 'info',
      title: 'Payment Method',
      description: 'Payment method update functionality coming soon.',
    });
  };

  const handleCancelSubscription = () => {
    addToast({
      type: 'info',
      title: 'Cancellation',
      description: 'Subscription cancellation functionality coming soon.',
    });
  };

  if (!user) {
    return null;
  }

  if (isLoadingData) {
    return (
      <MainLayout user={user}>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading billing information...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'trial': return 'text-blue-600 dark:text-blue-400';
      case 'cancelled': return 'text-red-600 dark:text-red-400';
      default: return 'text-neutral-600 dark:text-neutral-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'trial': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <MainLayout user={user}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Billing & Subscription
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Manage your subscription, billing information, and usage.
          </p>
        </div>

        {/* Current Plan */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Current Plan
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Your current subscription details
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 ${getStatusColor(billingInfo.plan.status)}`}>
              {getStatusIcon(billingInfo.plan.status)}
              <span className="font-medium capitalize">{billingInfo.plan.status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-3">
                {billingInfo.plan.name}
              </h3>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {formatCurrency(billingInfo.plan.price)}
                  </span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    /{billingInfo.plan.interval}
                  </span>
                </div>
                {billingInfo.plan.trialEndsAt && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Trial ends on {billingInfo.plan.trialEndsAt.toLocaleDateString()}
                  </p>
                )}
                {billingInfo.plan.nextBillingDate && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Next billing: {billingInfo.plan.nextBillingDate.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">
                Plan Features
              </h4>
              <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
                {billingInfo.plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {billingInfo.plan.status === 'trial' && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Your free trial is active
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Upgrade now to continue using all features after your trial ends.
                  </p>
                </div>
                <Button size="sm">
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Usage Overview */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
            Usage Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(billingInfo.usage).map(([key, usage]) => {
              const percentage = (usage.used / usage.limit) * 100;
              const isNearLimit = percentage > 80;
              
              return (
                <div key={key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <span className={`text-xs font-medium ${
                      isNearLimit ? 'text-orange-600 dark:text-orange-400' : 'text-neutral-600 dark:text-neutral-400'
                    }`}>
                      {usage.used}/{usage.limit}
                    </span>
                  </div>
                  
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isNearLimit 
                          ? 'bg-orange-500' 
                          : percentage === 100 
                            ? 'bg-red-500' 
                            : 'bg-primary-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {percentage.toFixed(0)}% used
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available Plans */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
            Available Plans
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-6 border rounded-lg ${
                  plan.popular
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                      /month
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    or {formatCurrency(plan.yearlyPrice)}/year (save 17%)
                  </p>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-neutral-700 dark:text-neutral-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  variant={plan.popular ? 'primary' : 'outline'}
                  onClick={() => handleUpgrade(plan.name)}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {billingInfo.plan.name === plan.name ? 'Current Plan' : 'Upgrade'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Payment Method
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Manage your payment information
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleUpdatePaymentMethod}
            >
              {billingInfo.paymentMethod ? 'Update' : 'Add'} Payment Method
            </Button>
          </div>

          {billingInfo.paymentMethod ? (
            <div className="flex items-center gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <CreditCard className="w-8 h-8 text-neutral-600 dark:text-neutral-400" />
              <div>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {billingInfo.paymentMethod.brand} ending in {billingInfo.paymentMethod.last4}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Expires {billingInfo.paymentMethod.expiryMonth}/{billingInfo.paymentMethod.expiryYear}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-600 dark:text-neutral-400">
              <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No payment method on file</p>
              <p className="text-xs">Add a payment method to upgrade your plan</p>
            </div>
          )}
        </div>

        {/* Billing History */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Billing History
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  View and download your invoices
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {billingInfo.billingHistory.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    invoice.status === 'paid' ? 'bg-green-500' :
                    invoice.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {invoice.description}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {invoice.date.toLocaleDateString()} • {formatCurrency(invoice.amount)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    invoice.status === 'paid' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : invoice.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {invoice.status}
                  </span>
                  
                  {invoice.status === 'paid' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        {billingInfo.plan.status === 'active' && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-red-200 dark:border-red-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h2 className="text-xl font-semibold text-red-900 dark:text-red-100">
                  Danger Zone
                </h2>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Irreversible actions that affect your subscription
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Cancel Subscription
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  You will lose access to premium features at the end of your billing period.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                className="text-red-600 hover:text-red-700 dark:text-red-400 border-red-300 hover:border-red-400"
              >
                Cancel Subscription
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}