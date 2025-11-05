'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, Theme, themes } from '@/lib/theme';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({ children, defaultMode = 'light' }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch by only setting theme after mount
  useEffect(() => {
    setMounted(true);
    
    // Check for saved theme preference or system preference
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      setModeState(savedMode);
    } else if (systemPrefersDark) {
      setModeState('dark');
    }
  }, []);

  // Update document class and localStorage when mode changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(mode);
    
    // Update CSS custom properties
    const theme = themes[mode];
    const root_style = root.style;
    
    // Set CSS custom properties for dynamic theming
    root_style.setProperty('--color-bg-primary', theme.colors.background.primary);
    root_style.setProperty('--color-bg-secondary', theme.colors.background.secondary);
    root_style.setProperty('--color-bg-tertiary', theme.colors.background.tertiary);
    root_style.setProperty('--color-bg-elevated', theme.colors.background.elevated);
    
    root_style.setProperty('--color-text-primary', theme.colors.text.primary);
    root_style.setProperty('--color-text-secondary', theme.colors.text.secondary);
    root_style.setProperty('--color-text-tertiary', theme.colors.text.tertiary);
    root_style.setProperty('--color-text-inverse', theme.colors.text.inverse);
    
    root_style.setProperty('--color-border-primary', theme.colors.border.primary);
    root_style.setProperty('--color-border-secondary', theme.colors.border.secondary);
    root_style.setProperty('--color-border-focus', theme.colors.border.focus);
    
    root_style.setProperty('--color-interactive-primary', theme.colors.interactive.primary);
    root_style.setProperty('--color-interactive-primary-hover', theme.colors.interactive.primaryHover);
    root_style.setProperty('--color-interactive-primary-active', theme.colors.interactive.primaryActive);
    root_style.setProperty('--color-interactive-secondary', theme.colors.interactive.secondary);
    root_style.setProperty('--color-interactive-secondary-hover', theme.colors.interactive.secondaryHover);
    root_style.setProperty('--color-interactive-tertiary', theme.colors.interactive.tertiary);
    root_style.setProperty('--color-interactive-tertiary-hover', theme.colors.interactive.tertiaryHover);
    
    root_style.setProperty('--color-semantic-success', theme.colors.semantic.success);
    root_style.setProperty('--color-semantic-success-bg', theme.colors.semantic.successBg);
    root_style.setProperty('--color-semantic-danger', theme.colors.semantic.danger);
    root_style.setProperty('--color-semantic-danger-bg', theme.colors.semantic.dangerBg);
    root_style.setProperty('--color-semantic-warning', theme.colors.semantic.warning);
    root_style.setProperty('--color-semantic-warning-bg', theme.colors.semantic.warningBg);
    root_style.setProperty('--color-semantic-info', theme.colors.semantic.info);
    root_style.setProperty('--color-semantic-info-bg', theme.colors.semantic.infoBg);
    
    // Save to localStorage
    localStorage.setItem('theme-mode', mode);
  }, [mode, mounted]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const toggleMode = () => {
    setModeState(current => current === 'light' ? 'dark' : 'light');
  };

  // Prevent flash of incorrect theme during SSR
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  const value: ThemeContextType = {
    theme: themes[mode],
    mode,
    setMode,
    toggleMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}