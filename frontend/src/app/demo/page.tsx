'use client';

import { useState } from 'react';
import { PhoneNumberInput } from '@/components/ui/phone-input';
import { CountrySelect } from '@/components/ui/country-select';

export default function DemoPage() {
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [isDark, setIsDark] = useState(false);

  // Toggle dark mode for testing
  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Enhanced Form Components Demo
            </h1>
            <button
              onClick={toggleDarkMode}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Toggle {isDark ? 'Light' : 'Dark'} Mode
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Phone Number Input
              </h2>
              <PhoneNumberInput
                value={phone}
                onChange={(value) => setPhone(value || '')}
                placeholder="Enter your phone number"
              />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Current value: {phone || 'None'}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Country Select
              </h2>
              <CountrySelect
                value={country}
                onChange={setCountry}
                placeholder="Select your country"
              />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected country: {country || 'None'}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Error States
              </h2>
              <div className="space-y-4">
                <PhoneNumberInput
                  value=""
                  onChange={() => {}}
                  placeholder="Phone with error"
                  error="Please enter a valid phone number"
                />
                <CountrySelect
                  value=""
                  onChange={() => {}}
                  placeholder="Country with error"
                  error="Please select a country"
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Form Data
              </h2>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm text-gray-900 dark:text-gray-100">
                {JSON.stringify({ phone, country }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}