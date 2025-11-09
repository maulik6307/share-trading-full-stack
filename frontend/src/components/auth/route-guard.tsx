'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

interface RouteGuardProps {
  children: React.ReactNode;
}

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/backtesting',
  '/paper-trading',
  '/trading',
  '/strategies',
  '/settings',
  '/demo',
];

// Define auth routes (login, signup, etc.)
const authRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
];

// Define public routes (no auth required)
const publicRoutes = [
  '/',
  '/contact',
  '/privacy',
  '/terms',
];

export function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return;

    // Check if current route is an auth route
    const isAuthRoute = authRoutes.some(route => 
      pathname.startsWith(route)
    );

    // Don't run guard logic on auth pages - let them handle their own redirects
    if (isAuthRoute) return;

    // Check if current route is protected
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    );

    // Only protect routes - redirect to login if not authenticated
    if (isProtectedRoute && !isAuthenticated) {
      // Save the intended destination
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
    }
  }, [pathname, isAuthenticated, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
