/**
 * Theme Configuration
 * Defines light and dark theme variants using design tokens
 */

import { designTokens } from './design-tokens';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: {
    // Background colors
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      elevated: string;
    };
    // Text colors
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
    // Border colors
    border: {
      primary: string;
      secondary: string;
      focus: string;
    };
    // Interactive colors
    interactive: {
      primary: string;
      primaryHover: string;
      primaryActive: string;
      secondary: string;
      secondaryHover: string;
      tertiary: string;
      tertiaryHover: string;
    };
    // Semantic colors
    semantic: {
      success: string;
      successBg: string;
      danger: string;
      dangerBg: string;
      warning: string;
      warningBg: string;
      info: string;
      infoBg: string;
    };
  };
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: {
      primary: designTokens.colors.neutral[0],
      secondary: designTokens.colors.neutral[50],
      tertiary: designTokens.colors.neutral[100],
      elevated: designTokens.colors.neutral[0],
    },
    text: {
      primary: designTokens.colors.neutral[900],
      secondary: designTokens.colors.neutral[600],
      tertiary: designTokens.colors.neutral[500],
      inverse: designTokens.colors.neutral[0],
    },
    border: {
      primary: designTokens.colors.neutral[200],
      secondary: designTokens.colors.neutral[300],
      focus: designTokens.colors.primary[500],
    },
    interactive: {
      primary: designTokens.colors.primary[600],
      primaryHover: designTokens.colors.primary[700],
      primaryActive: designTokens.colors.primary[800],
      secondary: designTokens.colors.neutral[100],
      secondaryHover: designTokens.colors.neutral[200],
      tertiary: 'transparent',
      tertiaryHover: designTokens.colors.neutral[100],
    },
    semantic: {
      success: designTokens.colors.success[600],
      successBg: designTokens.colors.success[50],
      danger: designTokens.colors.danger[600],
      dangerBg: designTokens.colors.danger[50],
      warning: designTokens.colors.warning[600],
      warningBg: designTokens.colors.warning[50],
      info: designTokens.colors.primary[600],
      infoBg: designTokens.colors.primary[50],
    },
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: {
      primary: designTokens.colors.neutral[950],
      secondary: designTokens.colors.neutral[900],
      tertiary: designTokens.colors.neutral[800],
      elevated: designTokens.colors.neutral[900],
    },
    text: {
      primary: designTokens.colors.neutral[50],
      secondary: designTokens.colors.neutral[400],
      tertiary: designTokens.colors.neutral[500],
      inverse: designTokens.colors.neutral[900],
    },
    border: {
      primary: designTokens.colors.neutral[800],
      secondary: designTokens.colors.neutral[700],
      focus: designTokens.colors.primary[400],
    },
    interactive: {
      primary: designTokens.colors.primary[500],
      primaryHover: designTokens.colors.primary[400],
      primaryActive: designTokens.colors.primary[300],
      secondary: designTokens.colors.neutral[800],
      secondaryHover: designTokens.colors.neutral[700],
      tertiary: 'transparent',
      tertiaryHover: designTokens.colors.neutral[800],
    },
    semantic: {
      success: designTokens.colors.success[400],
      successBg: designTokens.colors.success[950],
      danger: designTokens.colors.danger[400],
      dangerBg: designTokens.colors.danger[950],
      warning: designTokens.colors.warning[400],
      warningBg: designTokens.colors.warning[950],
      info: designTokens.colors.primary[400],
      infoBg: designTokens.colors.primary[950],
    },
  },
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;