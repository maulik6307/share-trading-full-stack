'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    X,
    Code,
    Settings,
    Play,
    Copy,
    Star,
    TrendingUp,
    BarChart3,
    Activity
} from 'lucide-react';
import { Button, Modal, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { StrategyTemplate, ParameterSchema } from '@/types/trading';
import { cn } from '@/lib/utils';

interface TemplatePreviewProps {
    template: StrategyTemplate | null;
    isOpen: boolean;
    onClose: () => void;
    onUseTemplate: (template: StrategyTemplate) => void;
    onCloneTemplate: (template: StrategyTemplate) => void;
    className?: string;
}

const categoryIcons: Record<string, React.ComponentType<any>> = {
    'Trend Following': TrendingUp,
    'Mean Reversion': BarChart3,
    'Volatility': Activity,
    'Momentum': Activity,
};

export function TemplatePreview({
    template,
    isOpen,
    onClose,
    onUseTemplate,
    onCloneTemplate,
    className,
}: TemplatePreviewProps) {
    const [activeTab, setActiveTab] = useState('overview');

    if (!template) return null;

    const Icon = categoryIcons[template.category] || Settings;

    const renderParameterSchema = () => {
        if (!template.parameterSchema || template.parameterSchema.length === 0) {
            return (
                <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-600 dark:text-neutral-400">
                        No parameter schema defined for this template
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {template.parameterSchema.map((param: ParameterSchema) => (
                    <div
                        key={param.key}
                        className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h4 className="font-medium text-neutral-900 dark:text-white">
                                    {param.label}
                                    {param.required && <span className="text-danger-500 ml-1">*</span>}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="inline-block px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded">
                                        {param.type}
                                    </span>
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                        Default: {String(param.defaultValue)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {param.description && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                                {param.description}
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-xs">
                            {param.type === 'number' || param.type === 'range' ? (
                                <>
                                    {param.min !== undefined && (
                                        <div>
                                            <span className="text-neutral-500">Min:</span>
                                            <span className="ml-1 text-neutral-700 dark:text-neutral-300 font-medium">
                                                {param.min}
                                            </span>
                                        </div>
                                    )}
                                    {param.max !== undefined && (
                                        <div>
                                            <span className="text-neutral-500">Max:</span>
                                            <span className="ml-1 text-neutral-700 dark:text-neutral-300 font-medium">
                                                {param.max}
                                            </span>
                                        </div>
                                    )}
                                    {param.step !== undefined && (
                                        <div>
                                            <span className="text-neutral-500">Step:</span>
                                            <span className="ml-1 text-neutral-700 dark:text-neutral-300 font-medium">
                                                {param.step}
                                            </span>
                                        </div>
                                    )}
                                </>
                            ) : param.type === 'select' && param.options ? (
                                <div className="col-span-2">
                                    <span className="text-neutral-500">Options:</span>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {param.options.map((option, index) => (
                                            <span
                                                key={index}
                                                className="inline-block px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded"
                                            >
                                                {option.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderCode = () => {
        if (!template.code) {
            return (
                <div className="text-center py-8">
                    <Code className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-600 dark:text-neutral-400">
                        No code implementation provided for this template
                    </p>
                </div>
            );
        }

        return (
            <div className="bg-neutral-900 dark:bg-neutral-800 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-neutral-100 dark:text-neutral-300">
                    <code>{template.code}</code>
                </pre>
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            className={cn('max-w-4xl', className)}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                            <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2 mb-1">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {template.name}
                                </h2>
                                {template.isBuiltIn && (
                                    <div className="flex items-center space-x-1">
                                        <Star className="h-4 w-4 text-warning-500" />
                                        <span className="text-sm text-warning-600 dark:text-warning-400">
                                            Built-in
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="inline-block px-2 py-1 text-sm bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded">
                                    {template.category}
                                </span>
                                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Created {template.createdAt.toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Description */}
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                    <p className="text-neutral-700 dark:text-neutral-300">
                        {template.description}
                    </p>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview" className="flex items-center space-x-2">
                            <Settings className="h-4 w-4" />
                            <span>Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="parameters" className="flex items-center space-x-2">
                            <Settings className="h-4 w-4" />
                            <span>Parameters</span>
                        </TabsTrigger>
                        <TabsTrigger value="code" className="flex items-center space-x-2">
                            <Code className="h-4 w-4" />
                            <span>Code</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6 overflow-y-auto max-h-72">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                                    Default Parameters
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(template.defaultParameters).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                    {key}
                                                </span>
                                                <span className="text-sm text-neutral-900 dark:text-white font-mono">
                                                    {String(value)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                                    Template Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
                                        <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                            Category
                                        </div>
                                        <div className="text-neutral-900 dark:text-white">
                                            {template.category}
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
                                        <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                            Parameters Count
                                        </div>
                                        <div className="text-neutral-900 dark:text-white">
                                            {template.parameterSchema?.length || 0} parameters
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
                                        <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                            Has Code
                                        </div>
                                        <div className="text-neutral-900 dark:text-white">
                                            {template.code ? 'Yes' : 'No'}
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
                                        <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                            Type
                                        </div>
                                        <div className="text-neutral-900 dark:text-white">
                                            {template.isBuiltIn ? 'Built-in' : 'Custom'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="parameters" className="mt-6 overflow-y-auto max-h-72">
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                                Parameter Schema
                            </h3>
                            {renderParameterSchema()}
                        </div>
                    </TabsContent>

                    <TabsContent value="code" className="mt-6 overflow-y-auto max-h-72">
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                                Code Implementation
                            </h3>
                            {renderCode()}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => onCloneTemplate(template)}
                            className="flex items-center space-x-2"
                        >
                            <Copy className="h-4 w-4" />
                            <span>Clone Template</span>
                        </Button>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button
                            onClick={() => onUseTemplate(template)}
                            className="flex items-center space-x-2"
                        >
                            <Play className="h-4 w-4" />
                            <span>Use This Template</span>
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}