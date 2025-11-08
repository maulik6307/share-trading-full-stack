'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Info, 
  AlertCircle, 
  CheckCircle,
  RotateCcw
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { ParameterSchema } from '@/types/trading';
import { cn } from '@/lib/utils';

interface ParameterBuilderProps {
  parameters: Record<string, any>;
  schema: ParameterSchema[];
  onChange: (parameters: Record<string, any>) => void;
  onValidationChange?: (isValid: boolean, errors: Record<string, string>) => void;
  className?: string;
}

export function ParameterBuilder({
  parameters,
  schema,
  onChange,
  onValidationChange,
  className,
}: ParameterBuilderProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Memoized validation function to prevent infinite re-renders
  const validateParameters = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    // Safety check: ensure schema is an array and filter out undefined elements
    const validSchema = Array.isArray(schema) ? schema.filter(param => param && param.key) : [];
    
    validSchema.forEach(param => {
      const value = parameters[param.key];
      
      // Required field validation
      if (param.required && (value === undefined || value === null || value === '')) {
        newErrors[param.key] = `${param.label} is required`;
        return;
      }
      
      // Skip validation if field is empty and not required
      if (!param.required && (value === undefined || value === null || value === '')) {
        return;
      }
      
      // Type-specific validation
      switch (param.type) {
        case 'number':
          const numValue = Number(value);
          if (isNaN(numValue)) {
            newErrors[param.key] = `${param.label} must be a valid number`;
          } else {
            if (param.min !== undefined && numValue < param.min) {
              newErrors[param.key] = `${param.label} must be at least ${param.min}`;
            }
            if (param.max !== undefined && numValue > param.max) {
              newErrors[param.key] = `${param.label} must be at most ${param.max}`;
            }
          }
          break;
          
        case 'range':
          const rangeValue = Number(value);
          if (isNaN(rangeValue)) {
            newErrors[param.key] = `${param.label} must be a valid number`;
          } else {
            if (param.min !== undefined && rangeValue < param.min) {
              newErrors[param.key] = `${param.label} must be at least ${param.min}`;
            }
            if (param.max !== undefined && rangeValue > param.max) {
              newErrors[param.key] = `${param.label} must be at most ${param.max}`;
            }
          }
          break;
          
        case 'select':
          if (param.options && !param.options.some(opt => opt.value === value)) {
            newErrors[param.key] = `${param.label} must be one of the available options`;
          }
          break;
      }
    });
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    onValidationChange?.(isValid, newErrors);
  }, [parameters, schema, onValidationChange]);

  // Validate parameters when they change
  useEffect(() => {
    validateParameters();
  }, [validateParameters]);

  const handleParameterChange = (key: string, value: any) => {
    setTouched(prev => ({ ...prev, [key]: true }));
    onChange({ ...parameters, [key]: value });
  };

  const resetToDefaults = () => {
    const defaultParams: Record<string, any> = {};
    schema.forEach(param => {
      defaultParams[param.key] = param.defaultValue;
    });
    onChange(defaultParams);
    setTouched({});
  };

  const renderParameter = (param: ParameterSchema) => {
    const value = parameters[param.key] ?? param.defaultValue;
    const hasError = errors[param.key] && touched[param.key];
    const isValid = touched[param.key] && !errors[param.key] && param.required;

    return (
      <motion.div
        key={param.key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {param.label}
            {param.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
          <div className="flex items-center space-x-1">
            {isValid && (
              <CheckCircle className="h-4 w-4 text-success-500" />
            )}
            {hasError && (
              <AlertCircle className="h-4 w-4 text-danger-500" />
            )}
            {param.description && (
              <div className="group relative">
                <Info className="h-4 w-4 text-neutral-400 cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {param.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {param.type === 'number' && (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleParameterChange(param.key, Number(e.target.value))}
            min={param.min}
            max={param.max}
            step={param.step}
            error={hasError ? errors[param.key] : undefined}
            className={cn(
              isValid && 'border-success-300 focus:border-success-500 focus:ring-success-500'
            )}
          />
        )}

        {param.type === 'string' && (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => handleParameterChange(param.key, e.target.value)}
            error={hasError ? errors[param.key] : undefined}
            className={cn(
              isValid && 'border-success-300 focus:border-success-500 focus:ring-success-500'
            )}
          />
        )}

        {param.type === 'boolean' && (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleParameterChange(param.key, e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-white border-neutral-300 rounded focus:ring-primary-500 focus:ring-2"
            />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              Enable {param.label.toLowerCase()}
            </span>
          </label>
        )}

        {param.type === 'select' && param.options && (
          <select
            value={value || ''}
            onChange={(e) => handleParameterChange(param.key, e.target.value)}
            className={cn(
              'w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              hasError 
                ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500'
                : isValid
                ? 'border-success-300 focus:border-success-500 focus:ring-success-500'
                : 'border-neutral-300 dark:border-neutral-600'
            )}
          >
            <option value="">Select {param.label}</option>
            {param.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {param.type === 'range' && (
          <div className="space-y-2">
            <input
              type="range"
              min={param.min}
              max={param.max}
              step={param.step}
              value={value || param.defaultValue}
              onChange={(e) => handleParameterChange(param.key, Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700 slider"
            />
            <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span>{param.min}</span>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {value || param.defaultValue}
              </span>
              <span>{param.max}</span>
            </div>
          </div>
        )}

        {hasError && (
          <p className="text-sm text-danger-600 dark:text-danger-400 flex items-center space-x-1">
            <AlertCircle className="h-4 w-4" />
            <span>{errors[param.key]}</span>
          </p>
        )}
      </motion.div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Strategy Parameters
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset to Defaults</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.isArray(schema) && schema.filter(param => param && param.key).map(renderParameter)}
      </div>

      {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
        <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-danger-600" />
            <h4 className="text-sm font-medium text-danger-800 dark:text-danger-200">
              Please fix the following errors:
            </h4>
          </div>
          <ul className="text-sm text-danger-700 dark:text-danger-300 space-y-1">
            {Object.entries(errors).map(([key, error]) => (
              touched[key] && (
                <li key={key} className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-danger-500 rounded-full"></span>
                  <span>{error}</span>
                </li>
              )
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}