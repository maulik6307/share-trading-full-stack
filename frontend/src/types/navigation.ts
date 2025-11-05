import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NavigationState {
  isLeftRailCollapsed: boolean;
  isMobileMenuOpen: boolean;
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
}