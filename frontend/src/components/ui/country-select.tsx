'use client';

import React, { useState, useEffect } from 'react';
import Select, { SingleValue, StylesConfig } from 'react-select';
import { cn } from '@/lib/utils';

interface Country {
  value: string;
  label: string;
  flag: string;
}

interface CountrySelectProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  disabled?: boolean;
}

// Popular countries list with flags
const countryOptions: Country[] = [
  { value: 'United States', label: 'United States', flag: '🇺🇸' },
  { value: 'Canada', label: 'Canada', flag: '🇨🇦' },
  { value: 'United Kingdom', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'Germany', label: 'Germany', flag: '🇩🇪' },
  { value: 'France', label: 'France', flag: '🇫🇷' },
  { value: 'Italy', label: 'Italy', flag: '🇮🇹' },
  { value: 'Spain', label: 'Spain', flag: '🇪🇸' },
  { value: 'Netherlands', label: 'Netherlands', flag: '🇳🇱' },
  { value: 'Switzerland', label: 'Switzerland', flag: '🇨🇭' },
  { value: 'Austria', label: 'Austria', flag: '🇦🇹' },
  { value: 'Belgium', label: 'Belgium', flag: '🇧🇪' },
  { value: 'Sweden', label: 'Sweden', flag: '🇸🇪' },
  { value: 'Norway', label: 'Norway', flag: '🇳🇴' },
  { value: 'Denmark', label: 'Denmark', flag: '🇩🇰' },
  { value: 'Finland', label: 'Finland', flag: '🇫🇮' },
  { value: 'Australia', label: 'Australia', flag: '🇦🇺' },
  { value: 'New Zealand', label: 'New Zealand', flag: '🇳🇿' },
  { value: 'Japan', label: 'Japan', flag: '🇯🇵' },
  { value: 'South Korea', label: 'South Korea', flag: '🇰🇷' },
  { value: 'Singapore', label: 'Singapore', flag: '🇸🇬' },
  { value: 'Hong Kong', label: 'Hong Kong', flag: '🇭🇰' },
  { value: 'India', label: 'India', flag: '🇮🇳' },
  { value: 'China', label: 'China', flag: '🇨🇳' },
  { value: 'Brazil', label: 'Brazil', flag: '🇧🇷' },
  { value: 'Mexico', label: 'Mexico', flag: '🇲🇽' },
  { value: 'Argentina', label: 'Argentina', flag: '🇦🇷' },
  { value: 'Chile', label: 'Chile', flag: '🇨🇱' },
  { value: 'South Africa', label: 'South Africa', flag: '🇿🇦' },
  { value: 'Israel', label: 'Israel', flag: '🇮🇱' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates', flag: '🇦🇪' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia', flag: '🇸🇦' },
  { value: 'Turkey', label: 'Turkey', flag: '🇹🇷' },
  { value: 'Russia', label: 'Russia', flag: '🇷🇺' },
  { value: 'Poland', label: 'Poland', flag: '🇵🇱' },
  { value: 'Czech Republic', label: 'Czech Republic', flag: '🇨🇿' },
  { value: 'Hungary', label: 'Hungary', flag: '🇭🇺' },
  { value: 'Portugal', label: 'Portugal', flag: '🇵🇹' },
  { value: 'Greece', label: 'Greece', flag: '🇬🇷' },
  { value: 'Ireland', label: 'Ireland', flag: '🇮🇪' },
  { value: 'Luxembourg', label: 'Luxembourg', flag: '🇱🇺' },
  { value: 'Malta', label: 'Malta', flag: '🇲🇹' },
  { value: 'Cyprus', label: 'Cyprus', flag: '🇨🇾' },
].sort((a, b) => a.label.localeCompare(b.label));

// Custom option component to show flag
const CustomOption = ({ data, ...props }: any) => (
  <div
    {...props.innerProps}
    className={cn(
      "flex items-center px-3 py-2 cursor-pointer text-neutral-900 dark:text-neutral-100",
      "hover:bg-neutral-100 dark:hover:bg-neutral-700",
      props.isFocused && "bg-neutral-100 dark:bg-neutral-700",
      props.isSelected && "bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100"
    )}
  >
    <span className="mr-3 text-lg">{data.flag}</span>
    <span className="text-sm">{data.label}</span>
  </div>
);

// Custom single value component to show flag
const CustomSingleValue = ({ data, ...props }: any) => (
  <div {...props.innerProps} className="flex items-center text-neutral-900 dark:text-neutral-100">
    <span className="mr-2 text-sm">{data.flag}</span>
    <span className="text-sm">{data.label}</span>
  </div>
);

// Custom Menu component with forced z-index
const CustomMenu = (props: any) => (
  <div
    {...props.innerProps}
    style={{
      ...props.innerProps?.style,
      zIndex: 999999,
      position: 'relative',
    }}
  >
    {props.children}
  </div>
);

export function CountrySelect({
  value,
  onChange,
  placeholder = "Select country",
  className,
  error,
  disabled = false,
}: CountrySelectProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const selectedOption = countryOptions.find(option => option.value === value);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const darkMode = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(darkMode);

      // Set data-theme attribute on body for CSS targeting
      document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    };

    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  const handleChange = (selectedOption: SingleValue<Country>) => {
    onChange(selectedOption?.value || '');
  };

  const customStyles: StylesConfig<Country, false> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      border: error
        ? '1px solid #ef4444'
        : state.isFocused
          ? '2px solid #3b82f6'
          : '1px solid #d1d5db',
      borderRadius: '6px',
      boxShadow: state.isFocused
        ? error
          ? '0 0 0 1px #ef4444'
          : '0 0 0 1px #3b82f6'
        : 'none',
      '&:hover': {
        borderColor: error ? '#ef4444' : '#9ca3af',
      },
      backgroundColor: 'white',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '2px 12px',
    }),
    input: (provided) => ({
      ...provided,
      margin: '0',
      padding: '0',
      color: 'inherit',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      paddingRight: '8px',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#6b7280',
      '&:hover': {
        color: '#374151',
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: '#6b7280',
      '&:hover': {
        color: '#374151',
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: 999999,
      backgroundColor: 'white',
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '4px',
      maxHeight: '200px',
      backgroundColor: 'white',
    }),
    option: () => ({
      // Custom styling handled by CustomOption component
    }),
    singleValue: () => ({
      // Custom styling handled by CustomSingleValue component
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#6b7280',
      fontSize: '14px',
    }),
  };



  // Dark mode styles
  const darkModeStyles: StylesConfig<Country, false> = {
    ...customStyles,
    control: (provided, state) => ({
      ...customStyles.control!(provided, state),
      backgroundColor: '#1f2937',
      borderColor: error
        ? '#ef4444'
        : state.isFocused
          ? '#3b82f6'
          : '#4b5563',
      '&:hover': {
        borderColor: error ? '#ef4444' : '#6b7280',
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#9ca3af',
      '&:hover': {
        color: '#d1d5db',
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: '#9ca3af',
      '&:hover': {
        color: '#d1d5db',
      },
    }),
    menu: (provided, state) => ({
      ...customStyles.menu!(provided, state),
      backgroundColor: '#1f2937',
      borderColor: '#4b5563',
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '4px',
      maxHeight: '200px',
      backgroundColor: '#1f2937',
    }),
    placeholder: (provided, state) => ({
      ...customStyles.placeholder!(provided, state),
      color: '#9ca3af',
    }),
  };

  return (
    <div className={cn("space-y-1", className)}>
      <Select<Country>
        options={countryOptions}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        isDisabled={disabled}
        isSearchable
        isClearable
        components={{
          Option: CustomOption,
          SingleValue: CustomSingleValue,
          Menu: CustomMenu,
        }}
        styles={isDarkMode ? darkModeStyles : customStyles}
        className={cn("react-select-container", isDarkMode && "dark-mode")}
        classNamePrefix="react-select"
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        menuShouldScrollIntoView={false}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}