'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useNavigationStore } from '@/stores/navigation-store';
import { getBreadcrumbs } from '@/lib/navigation';
import { getRouteMetadata } from '@/lib/route-utils';

export function useNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentPath,
    breadcrumbs,
    setCurrentPath,
    setBreadcrumbs,
    setMobileMenuOpen,
  } = useNavigationStore();

  // Update navigation state when pathname changes
  useEffect(() => {
    if (pathname !== currentPath) {
      setCurrentPath(pathname);
      const newBreadcrumbs = getBreadcrumbs(pathname);
      setBreadcrumbs(newBreadcrumbs);
      
      // Close mobile menu on route change
      setMobileMenuOpen(false);
      
      // Update document title
      const metadata = getRouteMetadata(pathname);
      document.title = metadata.title;
    }
  }, [pathname, currentPath, setCurrentPath, setBreadcrumbs, setMobileMenuOpen]);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const navigateBack = () => {
    router.back();
  };

  const navigateForward = () => {
    router.forward();
  };

  return {
    currentPath: pathname,
    breadcrumbs,
    navigateTo,
    navigateBack,
    navigateForward,
  };
}