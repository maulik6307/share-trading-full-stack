'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Code, Layers, Palette } from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';
import { StrategyTemplate } from '@/types/trading';
import { TemplateSelector } from './template-selector';
import { TemplatePreview } from './template-preview';
import { cn } from '@/lib/utils';

interface CreateStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFromTemplate: (template: StrategyTemplate, name: string) => void;
  onCreateFromScratch: (type: 'CODE' | 'VISUAL', name: string, description: string) => void;
  templates: StrategyTemplate[];
}

type CreationMode = 'select' | 'template' | 'scratch';
type StrategyType = 'CODE' | 'VISUAL';

export function CreateStrategyModal({
  isOpen,
  onClose,
  onCreateFromTemplate,
  onCreateFromScratch,
  templates,
}: CreateStrategyModalProps) {
  const [mode, setMode] = useState<CreationMode>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<StrategyTemplate | null>(null);
  const [strategyType, setStrategyType] = useState<StrategyType>('CODE');
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<StrategyTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleClose = () => {
    setMode('select');
    setSelectedTemplate(null);
    setShowTemplatePreview(false);
    setPreviewTemplate(null);
    setFormData({ name: '', description: '' });
    onClose();
  };

  const handlePreviewTemplate = (template: StrategyTemplate) => {
    setPreviewTemplate(template);
    setShowTemplatePreview(true);
  };

  const handleCloneTemplate = (template: StrategyTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: `${template.name} (Copy)`,
      description: template.description,
    });
    setMode('template');
    setShowTemplatePreview(false);
  };

  const handleUseTemplateFromPreview = (template: StrategyTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
    });
    setMode('template');
    setShowTemplatePreview(false);
  };

  const handleCreateFromTemplate = () => {
    if (selectedTemplate && formData.name.trim()) {
      onCreateFromTemplate(selectedTemplate, formData.name.trim());
      handleClose();
    }
  };

  const handleCreateFromScratch = () => {
    if (formData.name.trim()) {
      onCreateFromScratch(strategyType, formData.name.trim(), formData.description.trim());
      handleClose();
    }
  };

  const getTypeIcon = (type: StrategyType) => {
    switch (type) {
      case 'CODE':
        return Code;
      case 'VISUAL':
        return Palette;
      default:
        return Code;
    }
  };

  const renderSelectMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Create New Strategy
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Choose how you&apos;d like to create your trading strategy
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode('template')}
          className="p-6 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              From Template
            </h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Start with a pre-built strategy template and customize the parameters to fit your needs.
          </p>
          <div className="mt-4 text-xs text-primary-600 dark:text-primary-400">
            {templates.length} templates available
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode('scratch')}
          className="p-6 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900 rounded-lg flex items-center justify-center">
              <Plus className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              From Scratch
            </h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Build your own strategy from the ground up using our visual builder or code editor.
          </p>
          <div className="mt-4 text-xs text-secondary-600 dark:text-secondary-400">
            Full customization
          </div>
        </motion.button>
      </div>
    </div>
  );

  const renderTemplateMode = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Choose Template
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Select a strategy template to customize
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setMode('select')}
          className="flex items-center space-x-2 z-10"
        >
          <span>Back</span>
        </Button>
      </div>

      {selectedTemplate ? (
        <div className="space-y-4">
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
              Selected Template: {selectedTemplate.name}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              {selectedTemplate.description}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreviewTemplate(selectedTemplate)}
              >
                Preview Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
              >
                Choose Different Template
              </Button>
            </div>
          </div>

          <Input
            label="Strategy Name"
            placeholder="Enter a name for your strategy"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              placeholder="Describe your strategy..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateFromTemplate}
              disabled={!formData.name.trim()}
            >
              Create Strategy
            </Button>
          </div>
        </div>
      ) : (
        <TemplateSelector
          templates={templates}
          onSelectTemplate={setSelectedTemplate}
          onCloneTemplate={handleCloneTemplate}
          onPreviewTemplate={handlePreviewTemplate}
        />
      )}
    </div>
  );

  const renderScratchMode = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Create from Scratch
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Build your own custom strategy
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Strategy Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['CODE', 'VISUAL'] as StrategyType[]).map((type) => {
              const Icon = getTypeIcon(type);
              return (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStrategyType(type)}
                  className={cn(
                    'p-4 border rounded-lg text-left transition-colors',
                    strategyType === type
                      ? 'border-primary-300 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    <div>
                      <h3 className="font-medium text-neutral-900 dark:text-white">
                        {type === 'CODE' ? 'Code Editor' : 'Visual Builder'}
                      </h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {type === 'CODE'
                          ? 'Write JavaScript code'
                          : 'Drag & drop interface'
                        }
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <Input
          label="Strategy Name"
          placeholder="Enter a name for your strategy"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            placeholder="Describe your strategy..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateFromScratch}
            disabled={!formData.name.trim()}
          >
            Create Strategy
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      className={cn(
        mode === 'template' && !selectedTemplate ? "max-w-5xl" : "max-w-2xl"
      )}
    >
      <div className="relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          <X className="h-5 w-5" />
        </button>

        {mode === 'select' && renderSelectMode()}
        {mode === 'template' && renderTemplateMode()}
        {mode === 'scratch' && renderScratchMode()}
      </div>

      {/* Template Preview Modal */}
      <TemplatePreview
        template={previewTemplate}
        isOpen={showTemplatePreview}
        onClose={() => setShowTemplatePreview(false)}
        onUseTemplate={handleUseTemplateFromPreview}
        onCloneTemplate={handleCloneTemplate}
      />
    </Modal>
  );
}