'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedLandingPage } from '@/components/features/landing';
import { WelcomeModal, GuidedTour } from '@/components/features/onboarding';
import { useAuthStore } from '@/stores/auth-store';
import { useOnboardingStore } from '@/stores/onboarding-store';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { hasCompletedOnboarding, showWelcome, setShowWelcome } = useOnboardingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (mounted && isAuthenticated && hasCompletedOnboarding) {
      router.push('/dashboard');
    }
  }, [mounted, isAuthenticated, hasCompletedOnboarding, router]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Show welcome modal for new users
      if (!hasCompletedOnboarding) {
        setShowWelcome(true);
      } else {
        router.push('/dashboard');
      }
    }
  };

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  // Show landing page for unauthenticated users or new users
  if (!isAuthenticated || !hasCompletedOnboarding) {
    return (
      <>
        <EnhancedLandingPage onGetStarted={handleGetStarted} />
        
        {/* Welcome modal for authenticated but not onboarded users */}
        {isAuthenticated && (
          <WelcomeModal
            isOpen={showWelcome}
            onClose={() => setShowWelcome(false)}
            userName={user?.name}
          />
        )}

        {/* Guided tour */}
        <GuidedTour />
      </>
    );
  }

  // This should not be reached due to the redirect effect above
  return null;
}