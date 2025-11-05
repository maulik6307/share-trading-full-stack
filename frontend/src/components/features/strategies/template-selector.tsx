'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Copy, 
  Star, 
  TrendingUp, 
  BarChart3, 
  Activity,
  Plus,
  Eye
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { StrategyTemplate } from '@/types/trading';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  templates: StrategyTemplate[];
  onSelectTemplate: (template: StrategyTemplate) => void;
  onCloneTemplate: (template: StrategyTemplate) => void;
  onPreviewTemplate: (template: StrategyTemplate) => void;
  className?: string;
}

type TemplateCategory = 'All' | 'Trend Following' | 'Mean Reversion' | 'Volatility' | 'Momentum' | 'Custom';

const categoryIcons: Record<string, React.ComponentType<any>> = {
  'Trend Following': TrendingUp,
  'Mean Reversion': BarChart3,
  'Volatility': Activity,
  'Momentum': Activity,
  'Custom': Plus,
};

export function TemplateSelector({
  templates,
  onSelectTemplate,
  onCloneTemplate,
  onPreviewTemplate,
  className,
}: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('All');

  // Get unique categories from templates
  const categories = useMemo(() => {
    const cats = new Set(templates.map(t => t.category));
    return ['All', ...Array.from(cats)] as TemplateCategory[];
  }, [templates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    const filtered = templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [templates, searchQuery, selectedCategory]);

  const getCategoryIcon = (category: string) => {
    const Icon = categoryIcons[category] || Plus;
    return Icon;
  };

  const renderTemplateCard = (template: StrategyTemplate) => {
    const Icon = getCategoryIcon(template.category);
    
    return (
      <motion.div
        key={template.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                {template.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-block px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded">
                  {template.category}
                </span>
                {template.isBuiltIn && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-warning-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
          {template.description}
        </p>

        <div className="mb-3">
          <h4 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Key Parameters
          </h4>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(template.defaultParameters).slice(0, 4).map(([key, value]) => (
              <div key={key} className="text-xs truncate">
                <span className="text-neutral-500 dark:text-neutral-400">{key}:</span>
                <span className="ml-1 text-neutral-700 dark:text-neutral-300 font-medium">
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
          {Object.keys(template.defaultParameters).length > 4 && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              +{Object.keys(template.defaultParameters).length - 4} more
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreviewTemplate(template)}
              className="flex items-center space-x-1 text-xs px-2 py-1 h-7"
            >
              <Eye className="h-3 w-3" />
              <span>Preview</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCloneTemplate(template)}
              className="flex items-center space-x-1 text-xs px-2 py-1 h-7"
            >
              <Copy className="h-3 w-3" />
              <span>Clone</span>
            </Button>
          </div>
          <Button
            size="sm"
            onClick={() => onSelectTemplate(template)}
            className="flex items-center space-x-1 text-xs px-3 py-1 h-7"
          >
            <Plus className="h-3 w-3" />
            <span>Use</span>
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-neutral-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory)}
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 h-9"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
          {filteredTemplates.map(renderTemplateCard)}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
            No templates found
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}