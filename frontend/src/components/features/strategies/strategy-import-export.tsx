'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Upload, 
  FileText, 
  Check, 
  AlertTriangle,
  X,
  Copy,
  Share2
} from 'lucide-react';
import { Button, Modal, Input } from '@/components/ui';
import { Strategy, StrategyTemplate } from '@/types/trading';
import { cn } from '@/lib/utils';

interface StrategyImportExportProps {
  strategy?: Strategy;
  onImportStrategy?: (strategy: Partial<Strategy>) => void;
  onImportTemplate?: (template: StrategyTemplate) => void;
  className?: string;
}

interface ImportResult {
  success: boolean;
  data?: any;
  errors: string[];
  warnings: string[];
}

export function StrategyImportExport({
  strategy,
  onImportStrategy,
  onImportTemplate,
  className,
}: StrategyImportExportProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'template'>('json');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importData, setImportData] = useState('');
  const [shareableLink, setShareableLink] = useState('');

  const validateStrategyData = (data: any): ImportResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields for strategy
    if (data.type === undefined) {
      errors.push('Strategy type is required');
    }
    
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Strategy name is required and must be a string');
    }
    
    if (!data.parameters || typeof data.parameters !== 'object') {
      errors.push('Strategy parameters are required and must be an object');
    }
    
    // Check for code if it's a code-based strategy
    if (data.type === 'CODE' && !data.code) {
      warnings.push('Code-based strategy is missing code implementation');
    }
    
    // Validate parameter types
    if (data.parameters) {
      Object.entries(data.parameters).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          warnings.push(`Parameter '${key}' has null/undefined value`);
        }
      });
    }
    
    // Check for template-specific fields
    if (data.templateId && !data.type) {
      warnings.push('Template ID provided but strategy type not specified');
    }

    return {
      success: errors.length === 0,
      data,
      errors,
      warnings,
    };
  };

  const validateTemplateData = (data: any): ImportResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields for template
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Template name is required and must be a string');
    }
    
    if (!data.description || typeof data.description !== 'string') {
      errors.push('Template description is required and must be a string');
    }
    
    if (!data.category || typeof data.category !== 'string') {
      errors.push('Template category is required and must be a string');
    }
    
    if (!data.defaultParameters || typeof data.defaultParameters !== 'object') {
      errors.push('Template default parameters are required and must be an object');
    }
    
    if (!data.parameterSchema || !Array.isArray(data.parameterSchema)) {
      errors.push('Template parameter schema is required and must be an array');
    } else {
      // Validate parameter schema
      data.parameterSchema.forEach((param: any, index: number) => {
        if (!param.key || typeof param.key !== 'string') {
          errors.push(`Parameter schema item ${index} is missing 'key' field`);
        }
        if (!param.label || typeof param.label !== 'string') {
          errors.push(`Parameter schema item ${index} is missing 'label' field`);
        }
        if (!param.type || !['number', 'string', 'boolean', 'select', 'range'].includes(param.type)) {
          errors.push(`Parameter schema item ${index} has invalid 'type' field`);
        }
      });
    }

    return {
      success: errors.length === 0,
      data,
      errors,
      warnings,
    };
  };

  const exportStrategy = () => {
    if (!strategy) return;

    let exportData: any;
    let filename: string;

    if (exportFormat === 'json') {
      exportData = {
        ...strategy,
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0',
      };
      filename = `strategy-${strategy.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    } else {
      // Export as template
      exportData = {
        id: `template-${Date.now()}`,
        name: `${strategy.name} Template`,
        description: strategy.description || `Template based on ${strategy.name}`,
        category: 'Custom',
        defaultParameters: strategy.parameters,
        parameterSchema: generateParameterSchema(strategy.parameters),
        code: strategy.code,
        isBuiltIn: false,
        createdAt: new Date().toISOString(),
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0',
      };
      filename = `template-${strategy.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    }

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    setShowExportModal(false);
  };

  const generateParameterSchema = (parameters: Record<string, any>) => {
    return Object.entries(parameters).map(([key, value]) => {
      const baseSchema = {
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        required: true,
        description: `Parameter for ${key}`,
      };

      if (typeof value === 'number') {
        return {
          ...baseSchema,
          type: 'number',
          defaultValue: value,
          min: 0,
          max: value * 10,
          step: value < 1 ? 0.1 : 1,
        };
      } else if (typeof value === 'boolean') {
        return {
          ...baseSchema,
          type: 'boolean',
          defaultValue: value,
        };
      } else if (typeof value === 'string') {
        // Check if it looks like a symbol
        if (['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'].includes(value)) {
          return {
            ...baseSchema,
            type: 'select',
            defaultValue: value,
            options: [
              { label: 'Reliance', value: 'RELIANCE' },
              { label: 'TCS', value: 'TCS' },
              { label: 'HDFC Bank', value: 'HDFCBANK' },
              { label: 'Infosys', value: 'INFY' },
            ],
          };
        }
        return {
          ...baseSchema,
          type: 'string',
          defaultValue: value,
        };
      }

      return {
        ...baseSchema,
        type: 'string',
        defaultValue: String(value),
      };
    });
  };

  const handleImport = () => {
    if (!importData.trim()) return;

    try {
      const parsed = JSON.parse(importData);
      
      // Determine if it's a strategy or template
      const isTemplate = parsed.parameterSchema && parsed.defaultParameters && parsed.category;
      
      let result: ImportResult;
      if (isTemplate) {
        result = validateTemplateData(parsed);
        if (result.success && onImportTemplate) {
          onImportTemplate(parsed as StrategyTemplate);
        }
      } else {
        result = validateStrategyData(parsed);
        if (result.success && onImportStrategy) {
          onImportStrategy(parsed as Partial<Strategy>);
        }
      }
      
      setImportResult(result);
      
      if (result.success) {
        setTimeout(() => {
          setShowImportModal(false);
          setImportData('');
          setImportResult(null);
        }, 2000);
      }
    } catch (error) {
      setImportResult({
        success: false,
        errors: ['Invalid JSON format. Please check your data and try again.'],
        warnings: [],
      });
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const generateShareableLink = () => {
    if (!strategy) return;

    const shareData = {
      name: strategy.name,
      description: strategy.description,
      type: strategy.type,
      parameters: strategy.parameters,
      code: strategy.code,
    };

    const encoded = btoa(JSON.stringify(shareData));
    const link = `${window.location.origin}/strategies/shared?data=${encoded}`;
    setShareableLink(link);
  };

  const copyShareableLink = () => {
    navigator.clipboard.writeText(shareableLink);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Import & Export
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </Button>
          
          {strategy && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowExportModal(true)}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={generateShareableLink}
                className="flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        size="md"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Export Strategy
            </h2>
            <button
              onClick={() => setShowExportModal(false)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Export Format
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="json"
                    checked={exportFormat === 'json'}
                    onChange={(e) => setExportFormat(e.target.value as 'json' | 'template')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-white">
                      Strategy JSON
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Export as a complete strategy that can be imported and used directly
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="template"
                    checked={exportFormat === 'template'}
                    onChange={(e) => setExportFormat(e.target.value as 'json' | 'template')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <div>
                    <div className="font-medium text-neutral-900 dark:text-white">
                      Strategy Template
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Export as a reusable template with parameter schema
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {strategy && (
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Strategy Details:
                </h4>
                <div className="space-y-1 text-sm">
                  <div><span className="text-neutral-500">Name:</span> {strategy.name}</div>
                  <div><span className="text-neutral-500">Type:</span> {strategy.type}</div>
                  <div><span className="text-neutral-500">Parameters:</span> {Object.keys(strategy.parameters).length}</div>
                  {strategy.code && <div><span className="text-neutral-500">Has Code:</span> Yes</div>}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button onClick={exportStrategy}>
              Export Strategy
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Import Strategy or Template
            </h2>
            <button
              onClick={() => setShowImportModal(false)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
                id="import-file"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('import-file')?.click()}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Choose File</span>
              </Button>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                or paste JSON data below
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Strategy/Template JSON Data
              </label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your strategy or template JSON data here..."
                className="w-full h-64 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            {importResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'rounded-lg p-4 border',
                  importResult.success
                    ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
                    : 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800'
                )}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {importResult.success ? (
                    <Check className="h-5 w-5 text-success-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-danger-600" />
                  )}
                  <h4 className={cn(
                    'font-medium',
                    importResult.success
                      ? 'text-success-800 dark:text-success-200'
                      : 'text-danger-800 dark:text-danger-200'
                  )}>
                    {importResult.success ? 'Import Successful' : 'Import Failed'}
                  </h4>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-danger-700 dark:text-danger-300 mb-1">
                      Errors:
                    </p>
                    <ul className="text-sm text-danger-600 dark:text-danger-400 space-y-1">
                      {importResult.errors.map((error, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-1 h-1 bg-danger-500 rounded-full mt-2"></span>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {importResult.warnings.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-warning-700 dark:text-warning-300 mb-1">
                      Warnings:
                    </p>
                    <ul className="text-sm text-warning-600 dark:text-warning-400 space-y-1">
                      {importResult.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-1 h-1 bg-warning-500 rounded-full mt-2"></span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!importData.trim()}
            >
              Import
            </Button>
          </div>
        </div>
      </Modal>

      {/* Shareable Link Modal */}
      {shareableLink && (
        <Modal
          isOpen={!!shareableLink}
          onClose={() => setShareableLink('')}
          size="md"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Share Strategy
              </h2>
              <button
                onClick={() => setShareableLink('')}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-neutral-600 dark:text-neutral-400">
                Share this link to allow others to import your strategy:
              </p>
              
              <div className="flex items-center space-x-2">
                <Input
                  value={shareableLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={copyShareableLink}
                  className="flex items-center space-x-1"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </Button>
              </div>
              
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Note: This link contains your strategy data and will work as long as the URL remains accessible.
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setShareableLink('')}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}