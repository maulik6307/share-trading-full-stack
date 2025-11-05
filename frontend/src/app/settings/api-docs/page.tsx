'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout';
import { useAuthStore } from '@/stores/auth-store';
import { 
  Code, 
  Play, 
  AlertCircle, 
  Book, 
  Database,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { ApiEndpointCard, ApiTester, SchemaViewer, ErrorResponseViewer } from '@/components/features/api-docs';

export default function ApiDocsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'endpoints' | 'schemas' | 'errors' | 'testing'>('endpoints');

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'endpoints', label: 'API Endpoints', icon: Code },
    { id: 'schemas', label: 'Data Schemas', icon: Database },
    { id: 'errors', label: 'Error Responses', icon: AlertCircle },
    { id: 'testing', label: 'API Testing', icon: Play },
  ];

  return (
    <MainLayout user={user}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link
            href="/settings"
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              API Documentation
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Complete API reference with interactive examples and testing interface
            </p>
          </div>
        </div>

        {/* Overview Card */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Book className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
                ShareTrading API v1.0
              </h3>
              <p className="text-primary-700 dark:text-primary-300 text-sm mb-4">
                This documentation covers all available endpoints for the ShareTrading platform. 
                All examples use mock data for demonstration purposes.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-primary-700 dark:text-primary-300">Base URL: /api/v1</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-primary-700 dark:text-primary-300">Format: JSON</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-primary-700 dark:text-primary-300">Auth: Bearer Token</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="border-b border-neutral-200 dark:border-neutral-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'endpoints' && <ApiEndpointCard />}
            {activeTab === 'schemas' && <SchemaViewer />}
            {activeTab === 'errors' && <ErrorResponseViewer />}
            {activeTab === 'testing' && <ApiTester />}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}