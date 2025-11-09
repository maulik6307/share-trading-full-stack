import { Metadata } from 'next';

export const siteConfig = {
  name: 'ShareTrading',
  title: 'ShareTrading - AI-Powered Trading Platform | Paper Trading & Backtesting',
  description: 'Professional AI-driven paper trading and backtesting platform. Test your trading strategies risk-free with real-time market data, advanced analytics, and automated backtesting.',
  url: 'https://share-trading-full-stack.vercel.app',
  ogImage: 'https://share-trading-full-stack.vercel.app/og-image.png',
  keywords: [
    'paper trading',
    'backtesting',
    'trading platform',
    'stock trading simulator',
    'AI trading',
    'algorithmic trading',
    'trading strategies',
    'risk-free trading',
    'market simulation',
    'trading analytics',
    'portfolio management',
    'technical analysis',
    'trading education',
    'stock market simulator',
    'crypto trading simulator'
  ],
  authors: [
    {
      name: 'ShareTrading Team',
      url: 'https://share-trading-full-stack.vercel.app',
    },
  ],
  creator: 'ShareTrading',
  publisher: 'ShareTrading',
  category: 'Finance',
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@sharetrading',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};
