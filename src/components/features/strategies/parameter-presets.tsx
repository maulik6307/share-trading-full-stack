'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Trash2, 
  Download, 
  Upload, 
  Settings, 
  Star,
  Copy,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import { ParameterSchema } from '@/types/trading';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

interface ParameterPreset {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  isDefault: boolean;
  createdAt: Date;
  tags: string[];
}

interface ParameterPresetsProps {
  schema: ParameterSchema[];
  currentParameters: Record<string, any>;
  onApplyPreset: (parameters: Record<string, any>) => void;
  onSavePreset?: (preset: Omit<ParameterPreset, 'id' | 'createdAt'>) => void;
  onDeletePreset?: (presetId: string) => void;
  className?: string;
}

export function ParameterPresets({
  schema,
  currentParameters,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
  className,
}: ParameterPresetsProps) {
  const [presets, setPresets] = useState<ParameterPreset[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<ParameterPreset | null>(null);
  const [saveForm, setSaveForm] = useState({
    name: '',
    description: '',
    tags: '',
  });
  const { addToast } = useToast();

  // Load presets from localStorage on mount
  useEffect(() => {
    const savedPresets = localStorage.getItem('strategy-parameter-presets');
    if (savedPresets) {
      try {
        const parsed = JSON.parse(savedPresets);
        setPresets(parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
        })));
      } catch (error) {
        console.error('Failed to load parameter presets:', error);
      }
    }
  }, []);

  // Save presets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('strategy-parameter-presets', JSON.stringify(presets));
  }, [presets]);

  const validateParameters = (parameters: Record<string, any>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    schema.forEach(param => {
      const value = parameters[param.key];
      
      // Required field validation
      if (param.required && (value === undefined || value === null || value === '')) {
        errors.push(`${param.label} is required`);
        return;
      }
      
      // Skip validation if field is empty and not required
      if (!param.required && (value === undefined || value === null || value === '')) {
        return;
      }
      
      // Type-specific validation
      switch (param.type) {
        case 'number':
        case 'range':
          const numValue = Number(value);
          if (isNaN(numValue)) {
            errors.push(`${param.label} must be a valid number`);
          } else {
            if (param.min !== undefined && numValue < param.min) {
              errors.push(`${param.label} must be at least ${param.min}`);
            }
            if (param.max !== undefined && numValue > param.max) {
              errors.push(`${param.label} must be at most ${param.max}`);
            }
          }
          break;
          
        case 'select':
          if (param.options && !param.options.some(opt => opt.value === value)) {
            errors.push(`${param.label} must be one of the available options`);
          }
          break;
      }
    });
    
    return { isValid: errors.length === 0, errors };
  };

  const handleSavePreset = () => {
    if (!saveForm.name.trim()) return;
    
    const validation = validateParameters(currentParameters);
    if (!validation.isValid) {
      addToast({
        type: 'error',
        title: 'Invalid Parameters',
        description: `Cannot save preset: ${validation.errors.join(', ')}`
      });
      return;
    }

    const preset: ParameterPreset = {
      id: editingPreset?.id || `preset-${Date.now()}`,
      name: saveForm.name.trim(),
      description: saveForm.description.trim(),
      parameters: { ...currentParameters },
      isDefault: false,
      createdAt: editingPreset?.createdAt || new Date(),
      tags: saveForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    if (editingPreset) {
      setPresets(prev => prev.map(p => p.id === preset.id ? preset : p));
    } else {
      setPresets(prev => [...prev, preset]);
    }

    onSavePreset?.(preset);
    handleCloseSaveModal();
  };

  const handleDeletePreset = (presetId: string) => {
    if (confirm('Are you sure you want to delete this preset?')) {
      setPresets(prev => prev.filter(p => p.id !== presetId));
      onDeletePreset?.(presetId);
    }
  };

  const handleApplyPreset = (preset: ParameterPreset) => {
    const validation = validateParameters(preset.parameters);
    if (!validation.isValid) {
      addToast({
        type: 'error',
        title: 'Invalid Preset',
        description: `Cannot apply preset: ${validation.errors.join(', ')}`
      });
      return;
    }
    onApplyPreset(preset.parameters);
  };

  const handleClonePreset = (preset: ParameterPreset) => {
    setSaveForm({
      name: `${preset.name} (Copy)`,
      description: preset.description,
      tags: preset.tags.join(', '),
    });
    setEditingPreset(null);
    setShowSaveModal(true);
  };

  const handleEditPreset = (preset: ParameterPreset) => {
    setSaveForm({
      name: preset.name,
      description: preset.description,
      tags: preset.tags.join(', '),
    });
    setEditingPreset(preset);
    setShowSaveModal(true);
  };

  const handleCloseSaveModal = () => {
    setShowSaveModal(false);
    setEditingPreset(null);
    setSaveForm({ name: '', description: '', tags: '' });
  };

  const exportPresets = () => {
    const dataStr = JSON.stringify(presets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'strategy-parameter-presets.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          const validPresets = imported.filter(preset => 
            preset.id && preset.name && preset.parameters
          ).map(preset => ({
            ...preset,
            createdAt: new Date(preset.createdAt || Date.now()),
          }));
          
          setPresets(prev => [...prev, ...validPresets]);
          addToast({
            type: 'success',
            title: 'Import Successful',
            description: `Successfully imported ${validPresets.length} presets`
          });
        }
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Import Failed',
          description: 'Failed to import presets. Please check the file format.'
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Parameter Presets
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".json"
            onChange={importPresets}
            className="hidden"
            id="import-presets"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('import-presets')?.click()}
            className="flex items-center space-x-1"
          >
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportPresets}
            disabled={presets.length === 0}
            className="flex items-center space-x-1"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          
          <Button
            size="sm"
            onClick={() => setShowSaveModal(true)}
            className="flex items-center space-x-1"
          >
            <Save className="h-4 w-4" />
            <span>Save Current</span>
          </Button>
        </div>
      </div>

      {/* Presets List */}
      {presets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presets.map(preset => {
            const validation = validateParameters(preset.parameters);
            
            return (
              <motion.div
                key={preset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'bg-white dark:bg-neutral-800 border rounded-lg p-4 hover:shadow-md transition-shadow',
                  validation.isValid 
                    ? 'border-neutral-200 dark:border-neutral-700' 
                    : 'border-warning-300 dark:border-warning-600'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-neutral-900 dark:text-white">
                        {preset.name}
                      </h4>
                      {preset.isDefault && (
                        <Star className="h-4 w-4 text-warning-500" />
                      )}
                      {!validation.isValid && (
                        <div className="group relative">
                          <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            Invalid parameters: {validation.errors.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                    {preset.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        {preset.description}
                      </p>
                    )}
                    {preset.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {preset.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <h5 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Parameters:
                  </h5>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {Object.entries(preset.parameters).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="truncate">
                        <span className="text-neutral-500 dark:text-neutral-400">{key}:</span>
                        <span className="ml-1 text-neutral-700 dark:text-neutral-300 font-medium">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {Object.keys(preset.parameters).length > 4 && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      +{Object.keys(preset.parameters).length - 4} more
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleClonePreset(preset)}
                      className="flex items-center space-x-1"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPreset(preset)}
                      className="flex items-center space-x-1"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePreset(preset.id)}
                      className="flex items-center space-x-1 text-danger-600 hover:text-danger-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleApplyPreset(preset)}
                    disabled={!validation.isValid}
                    className="flex items-center space-x-1"
                  >
                    <Check className="h-3 w-3" />
                    <span>Apply</span>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <Settings className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
            No presets saved
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Save your current parameter configuration as a preset for quick reuse
          </p>
          <Button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center space-x-2 mx-auto"
          >
            <Save className="h-4 w-4" />
            <span>Save Current Parameters</span>
          </Button>
        </div>
      )}

      {/* Save Preset Modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={handleCloseSaveModal}
        size="md"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              {editingPreset ? 'Edit Preset' : 'Save Parameter Preset'}
            </h2>
            <button
              onClick={handleCloseSaveModal}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <Input
              label="Preset Name"
              placeholder="Enter a name for this preset"
              value={saveForm.name}
              onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                placeholder="Describe this parameter configuration..."
                value={saveForm.description}
                onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <Input
              label="Tags (Optional)"
              placeholder="Enter tags separated by commas"
              value={saveForm.tags}
              onChange={(e) => setSaveForm(prev => ({ ...prev, tags: e.target.value }))}
            />

            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Current Parameters:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(currentParameters).map(([key, value]) => (
                  <div key={key} className="truncate">
                    <span className="text-neutral-500 dark:text-neutral-400">{key}:</span>
                    <span className="ml-1 text-neutral-700 dark:text-neutral-300 font-medium">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleCloseSaveModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleSavePreset}
              disabled={!saveForm.name.trim()}
            >
              {editingPreset ? 'Update Preset' : 'Save Preset'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}