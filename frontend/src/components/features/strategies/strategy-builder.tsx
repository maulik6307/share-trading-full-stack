'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Play, 
  Eye, 
  Settings, 
  Code, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  FileText,
  Loader2
} from 'lucide-react';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { ParameterBuilder } from './parameter-builder';
import { CodeEditor } from './code-editor';
import { StrategyPreview } from './strategy-preview';
import { StrategyVersionManager } from './strategy-version-manager';
import { ParameterPresets } from './parameter-presets';
import { StrategyImportExport } from './strategy-import-export';
import { useStrategyTemplates } from '@/hooks/use-strategy-templates';
import { Strategy, ParameterSchema } from '@/types/trading';
import { cn } from '@/lib/utils';

interface StrategyBuilderProps {
  strategy: Strategy;
  onSave: (strategy: Strategy) => void;
  onRunBacktest?: (strategy: Strategy) => void;
  onPreview?: (strategy: Strategy) => void;
  onBack?: () => void;
  className?: string;
}

export function StrategyBuilder({
  strategy,
  onSave,
  onRunBacktest,
  onPreview,
  onBack,
  className,
}: StrategyBuilderProps) {
  const [activeTab, setActiveTab] = useState<string>('parameters');
  const [localStrategy, setLocalStrategy] = useState<Strategy>(strategy);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [parameterErrors, setParameterErrors] = useState<Record<string, string>>({});
  const [codeErrors, setCodeErrors] = useState<string[]>([]);
  const [isParametersValid, setIsParametersValid] = useState(true);
  const [isCodeValid, setIsCodeValid] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date>(strategy.updatedAt);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch templates to get parameter schema for template-based strategies
  const { templates, loading: templatesLoading } = useStrategyTemplates({ limit: 100 });

  // Find the template for this strategy
  const strategyTemplate = useMemo(() => {
    if (strategy.type === 'TEMPLATE' && strategy.templateId && templates.length > 0) {
      return templates.find(template => template._id === strategy.templateId);
    }
    return null;
  }, [strategy.type, strategy.templateId, templates]);

  // Generate parameter schema based on strategy type
  const parameterSchema = useMemo((): ParameterSchema[] => {
    if (strategy.type === 'TEMPLATE' && strategyTemplate && strategyTemplate.parameterSchema) {
      // Use the parameter schema from the template
      return strategyTemplate.parameterSchema.filter(param => param && param.key);
    }
    
    // For custom strategies, return basic parameters
    return [
      {
        key: 'symbol',
        label: 'Trading Symbol',
        type: 'select',
        defaultValue: 'RELIANCE',
        options: [
          { label: 'Reliance', value: 'RELIANCE' },
          { label: 'TCS', value: 'TCS' },
          { label: 'HDFC Bank', value: 'HDFCBANK' },
          { label: 'Infosys', value: 'INFY' },
        ],
        required: true,
        description: 'The stock symbol to trade',
      },
      {
        key: 'quantity',
        label: 'Quantity',
        type: 'number',
        defaultValue: 100,
        min: 1,
        max: 10000,
        step: 1,
        required: true,
        description: 'Number of shares to trade per signal',
      },
    ];
  }, [strategy.type, strategyTemplate]);

  // Check if strategy is valid
  const isStrategyValid = useMemo(() => {
    return isParametersValid && (strategy.type === 'VISUAL' || isCodeValid);
  }, [isParametersValid, isCodeValid, strategy.type]);

  // Update local strategy when prop changes
  useEffect(() => {
    setLocalStrategy(strategy);
    setHasUnsavedChanges(false);
  }, [strategy]);

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(localStrategy) !== JSON.stringify(strategy);
    setHasUnsavedChanges(hasChanges);
  }, [localStrategy, strategy]);

  const handleParameterChange = (parameters: Record<string, any>) => {
    setLocalStrategy(prev => ({
      ...prev,
      parameters,
      updatedAt: new Date(),
    }));
  };

  const handleCodeChange = (code: string) => {
    setLocalStrategy(prev => ({
      ...prev,
      code,
      updatedAt: new Date(),
    }));
  };

  const handleParameterValidation = useCallback((isValid: boolean, errors: Record<string, string>) => {
    setIsParametersValid(isValid);
    setParameterErrors(errors);
  }, []);

  const handleCodeValidation = useCallback((isValid: boolean, errors: string[]) => {
    setIsCodeValid(isValid);
    setCodeErrors(errors);
  }, []);

  const handleSave = () => {
    if (isStrategyValid) {
      const updatedStrategy = {
        ...localStrategy,
        updatedAt: new Date(),
      };
      onSave(updatedStrategy);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }
  };

  const handleRunBacktest = () => {
    if (isStrategyValid && onRunBacktest) {
      onRunBacktest(localStrategy);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
    if (onPreview) {
      onPreview(localStrategy);
    }
  };

  const handleVersionSave = (strategy: Strategy, version: any) => {
    // In a real implementation, this would save the version to backend
    console.log('Saving version:', version, 'for strategy:', strategy);
    onSave(strategy);
  };

  const getStatusIcon = () => {
    if (!isStrategyValid) {
      return <AlertTriangle className="h-5 w-5 text-danger-500" />;
    }
    if (hasUnsavedChanges) {
      return <Clock className="h-5 w-5 text-warning-500" />;
    }
    return <CheckCircle className="h-5 w-5 text-success-500" />;
  };

  const getStatusText = () => {
    if (!isStrategyValid) {
      return 'Strategy has validation errors';
    }
    if (hasUnsavedChanges) {
      return 'Unsaved changes';
    }
    return `Last saved ${lastSaved.toLocaleTimeString()}`;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          )}
          
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {localStrategy.name}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              {getStatusIcon()}
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {onPreview && (
            <Button
              variant="outline"
              onClick={handlePreview}
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </Button>
          )}
          
          {onRunBacktest && (
            <Button
              variant="outline"
              onClick={handleRunBacktest}
              disabled={!isStrategyValid}
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Run Backtest</span>
            </Button>
          )}
          
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || !isStrategyValid}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Strategy</span>
          </Button>
        </div>
      </div>

      {/* Strategy Info */}
      <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Strategy Type
            </label>
            <div className="flex items-center space-x-2">
              {localStrategy.type === 'CODE' ? (
                <Code className="h-4 w-4 text-primary-500" />
              ) : localStrategy.type === 'TEMPLATE' ? (
                <FileText className="h-4 w-4 text-primary-500" />
              ) : (
                <Settings className="h-4 w-4 text-primary-500" />
              )}
              <span className="text-sm text-neutral-900 dark:text-white">
                {localStrategy.type === 'CODE' ? 'Code-based' : 
                 localStrategy.type === 'TEMPLATE' ? 'Template-based' : 'Visual Builder'}
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Status
            </label>
            <span className={cn(
              'inline-block px-2 py-1 text-xs font-medium rounded',
              localStrategy.status === 'ACTIVE' && 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300',
              localStrategy.status === 'PAUSED' && 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300',
              localStrategy.status === 'STOPPED' && 'bg-danger-100 text-danger-800 dark:bg-danger-900/20 dark:text-danger-300',
              localStrategy.status === 'DRAFT' && 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300'
            )}>
              {localStrategy.status}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Last Updated
            </label>
            <span className="text-sm text-neutral-900 dark:text-white">
              {localStrategy.updatedAt.toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Template Info (if template-based strategy) */}
      {localStrategy.type === 'TEMPLATE' && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
          {templatesLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
              <span className="text-sm text-primary-700 dark:text-primary-300">Loading template details...</span>
            </div>
          ) : strategyTemplate ? (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
                  Based on: {strategyTemplate.name}
                </h3>
              </div>
              <p className="text-sm text-primary-700 dark:text-primary-300 mb-3">
                {strategyTemplate.description}
              </p>
              <div className="flex items-center space-x-4 text-xs text-primary-600 dark:text-primary-400">
                <span>Category: {strategyTemplate.category}</span>
                <span>•</span>
                <span>Used {strategyTemplate.usageCount} times</span>
                {strategyTemplate.rating > 0 && (
                  <>
                    <span>•</span>
                    <span>Rating: {strategyTemplate.rating.toFixed(1)}/5</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-primary-700 dark:text-primary-300">
              Template information not available
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className={cn('flex', showPreview && 'mr-0')}>
        <div className="flex-1">
          <Tabs defaultValue="parameters" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="parameters" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Parameters</span>
              </TabsTrigger>
              <TabsTrigger value="presets" className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Presets</span>
              </TabsTrigger>
              <TabsTrigger 
                value="code" 
                className="flex items-center space-x-2"
                disabled={localStrategy.type === 'VISUAL'}
              >
                <Code className="h-4 w-4" />
                <span>Code</span>
              </TabsTrigger>
              <TabsTrigger value="import-export" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Import/Export</span>
              </TabsTrigger>
              <TabsTrigger value="versions" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Versions</span>
              </TabsTrigger>
            </TabsList>

        <TabsContent value="parameters" className="mt-6">
          <ParameterBuilder
            parameters={localStrategy.parameters}
            schema={parameterSchema}
            onChange={handleParameterChange}
            onValidationChange={handleParameterValidation}
          />
        </TabsContent>

        <TabsContent value="presets" className="mt-6">
          <ParameterPresets
            schema={parameterSchema}
            currentParameters={localStrategy.parameters}
            onApplyPreset={handleParameterChange}
          />
        </TabsContent>

            <TabsContent value="code" className="mt-6">
              {localStrategy.type === 'CODE' ? (
                <CodeEditor
                  code={localStrategy.code || ''}
                  onChange={handleCodeChange}
                  onValidationChange={handleCodeValidation}
                />
              ) : localStrategy.type === 'TEMPLATE' && strategyTemplate ? (
                <div className="space-y-4">
                  <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-warning-600" />
                      <h4 className="text-sm font-medium text-warning-800 dark:text-warning-200">
                        Template Code (Read-Only)
                      </h4>
                    </div>
                    <p className="text-sm text-warning-700 dark:text-warning-300">
                      This code is from the template &quot;{strategyTemplate.name}&quot;. To modify the code, create a custom code-based strategy.
                    </p>
                  </div>
                  <CodeEditor
                    code={strategyTemplate.code || '// No code available for this template'}
                    onChange={() => {}} // Read-only
                    onValidationChange={() => {}}
                    readOnly={true}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    Code Editor Not Available
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {localStrategy.type === 'VISUAL' 
                      ? 'This strategy uses the visual builder. Switch to a code-based strategy to edit code.'
                      : 'Code not available for this strategy type.'
                    }
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="import-export" className="mt-6">
              <StrategyImportExport
                strategy={localStrategy}
                onImportStrategy={(importedStrategy) => {
                  setLocalStrategy(prev => ({
                    ...prev,
                    ...importedStrategy,
                    id: prev.id, // Keep original ID
                    updatedAt: new Date(),
                  }));
                }}
              />
            </TabsContent>

            <TabsContent value="versions" className="mt-6">
              <StrategyVersionManager
                strategy={localStrategy}
                onSave={handleVersionSave}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Validation Summary */}
      {(!isParametersValid || !isCodeValid) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-danger-600" />
            <h4 className="text-sm font-medium text-danger-800 dark:text-danger-200">
              Strategy Validation Issues
            </h4>
          </div>
          
          <div className="space-y-2">
            {!isParametersValid && Object.keys(parameterErrors).length > 0 && (
              <div>
                <p className="text-sm font-medium text-danger-700 dark:text-danger-300 mb-1">
                  Parameter Issues:
                </p>
                <ul className="text-sm text-danger-600 dark:text-danger-400 space-y-1">
                  {Object.entries(parameterErrors).map(([key, error]) => (
                    <li key={key} className="flex items-center space-x-2">
                      <span className="w-1 h-1 bg-danger-500 rounded-full"></span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {!isCodeValid && codeErrors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-danger-700 dark:text-danger-300 mb-1">
                  Code Issues:
                </p>
                <ul className="text-sm text-danger-600 dark:text-danger-400 space-y-1">
                  {codeErrors.map((error, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="w-1 h-1 bg-danger-500 rounded-full"></span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Strategy Preview Panel */}
      <StrategyPreview
        strategy={localStrategy}
        isVisible={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}