'use client';

import React from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  disabled?: boolean;
}

export function PhoneNumberInput({
  value,
  onChange,
  placeholder = "Enter phone number",
  className,
  error,
  disabled = false,
}: PhoneInputProps) {
  return (
    <div className="space-y-1">
      <PhoneInput
        international
        countryCallingCodeEditable={false}
        defaultCountry="US"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "phone-input-container",
          error && "phone-input-error",
          className
        )}
        numberInputProps={{
          className: cn(
            "flex h-10 w-full rounded-r-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900",
            "placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-400",
            error && "border-red-500 focus:ring-red-500"
          )
        }}
        countrySelectProps={{
          className: cn(
            "flex h-10 items-center justify-center rounded-l-md border border-r-0 border-neutral-300 bg-neutral-50 px-3 text-neutral-900",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "dark:border-neutral-600 dark:bg-neutral-700 dark:text-white",
            error && "border-red-500"
          )
        }}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      

    </div>
  );
}