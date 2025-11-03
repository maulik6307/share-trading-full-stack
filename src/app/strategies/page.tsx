'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Play,
  Pause,
  Square,
  FileText,
  Loader2
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button, Input } from '@/components/ui';
import { StrategyCard } from '@/components/features/strategies/strategy-card';
import { CreateStrategyModal } from '@/components/features/strategies/create-strategy-modal';
import { useAuthStore } from '@/stores/auth-store';
import { useStrategies, useStrategyStatusCounts, useStrategyActions } from '@/hooks/use-strategies';
import { useStrategyTemplates, useTemplateActions } from '@/hooks/use-strategy-templates';
import { Strategy as APIStrategy, StrategyTemplate as APIStrategyTemplate } from '@/lib/api/strategies';
import { Strategy, StrategyTemplate } from '@/types/trading';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'status' | 'updated' | 'performance';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'ACTIVE' | 'PAUSED' | 'STOPPED' | 'DRAFT';

export default function StrategiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Memoize API options to prevent unnecessary re-renders
  const apiOptions = useMemo(() => ({
    search: debouncedSearchQuery || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    sortBy: sortField === 'updated' ? 'updatedAt' : sortField,
    sortOrder,
    limit: 50
  }), [debouncedSearchQuery, statusFilter, sortField, sortOrder]);

  // API hooks with stable options
  const { strategies: apiStrategies, loading: strategiesLoading, refetch: refetchStrategies } = useStrategies(apiOptions);

  const { counts: statusCounts, loading: countsLoading } = useStrategyStatusCounts();
  const { templates, loading: templatesLoading } = useStrategyTemplates({ limit: 50 });
  const strategyActions = useStrategyActions();
  const templateActions = useTemplateActions();

  // Convert API strategies to UI format
  const strategies = useMemo(() => {
    return apiStrategies.map((apiStrategy): Strategy => ({
      id: apiStrategy._id,
      name: apiStrategy.name,
      description: apiStrategy.description,
      type: apiStrategy.type,
      status: apiStrategy.status,
      parameters: apiStrategy.parameters,
      code: apiStrategy.code,
      templateId: apiStrategy.templateId,
      isTemplate: false,
      tags: apiStrategy.tags,
      createdAt: new Date(apiStrategy.createdAt),
      updatedAt: new Date(apiStrategy.updatedAt),
      deployedAt: apiStrategy.deployedAt ? new Date(apiStrategy.deployedAt) : undefined,
      performance: apiStrategy.performance,
    }));
  }, [apiStrategies]);

  // Check if create modal should be opened from URL parameter
  useEffect(() => {
    const shouldCreate = searchParams.get('create');
    if (shouldCreate === 'true') {
      setShowCreateModal(true);
      // Clean up the URL parameter
      router.replace('/strategies');
    }
  }, [searchParams, router]);

  // Since filtering and sorting is handled by the API, we just use the strategies directly
  const filteredStrategies = strategies;

  const handleCreateFromTemplate = async (template: StrategyTemplate, name: string) => {
    try {
      // Convert UI template to API template
      const apiTemplate = templates.find(t => t._id === template.id);
      if (!apiTemplate) {
        throw new Error('Template not found');
      }

      const strategy = await templateActions.createFromTemplate(apiTemplate._id, {
        name,
        description: `Strategy based on ${template.name}`,
        parameters: template.defaultParameters,
        tags: [template.category.toLowerCase().replace(' ', '-')]
      });

      // Refresh strategies list
      refetchStrategies();

      // Navigate to builder
      router.push(`/strategies/builder?id=${strategy._id}`);
    } catch (error) {
      console.error('Failed to create strategy from template:', error);
    }
  };

  const handleCreateFromScratch = async (type: 'CODE' | 'VISUAL', name: string, description: string) => {
    try {
      const strategy = await strategyActions.createStrategy({
        name,
        description: description || `Custom ${type.toLowerCase()} strategy`,
        type,
        parameters: {},
        tags: ['custom']
      });

      // Refresh strategies list
      refetchStrategies();

      // Navigate to builder
      router.push(`/strategies/builder?id=${strategy._id}`);
    } catch (error) {
      console.error('Failed to create strategy:', error);
    }
  };

  const handleStrategyAction = async (action: string, strategy: Strategy) => {
    try {
      switch (action) {
        case 'edit':
          router.push(`/strategies/builder?id=${strategy.id}`);
          break;
        case 'clone':
          await strategyActions.cloneStrategy(strategy.id, `${strategy.name} (Copy)`);
          refetchStrategies();
          break;
        case 'delete':
          await strategyActions.deleteStrategy(strategy.id);
          refetchStrategies();
          break;
        case 'deploy':
          await strategyActions.deployStrategy(strategy.id);
          refetchStrategies();
          break;
        case 'pause':
          await strategyActions.pauseStrategy(strategy.id);
          refetchStrategies();
          break;
        case 'stop':
          await strategyActions.stopStrategy(strategy.id);
          refetchStrategies();
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} strategy:`, error);
    }
  };

  const getStatusCount = (status: StatusFilter) => {
    if (status === 'all') return statusCounts.total;
    return statusCounts[status] || 0;
  };

  // Convert API templates to UI format
  const uiTemplates = useMemo(() => {
    return templates.map((apiTemplate): StrategyTemplate => ({
      id: apiTemplate._id,
      name: apiTemplate.name,
      description: apiTemplate.description,
      category: apiTemplate.category,
      defaultParameters: apiTemplate.defaultParameters,
      parameterSchema: apiTemplate.parameterSchema,
      code: apiTemplate.code,
      isBuiltIn: apiTemplate.isBuiltIn,
      createdAt: new Date(apiTemplate.createdAt),
    }));
  }, [templates]);

  if (!user) {
    return null;
  }

  const isLoading = strategiesLoading || countsLoading || templatesLoading;

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              Strategy Library
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Manage and create your trading strategies
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Strategy</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search strategies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>

            <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                >
                  <option value="all">All ({getStatusCount('all')})</option>
                  <option value="ACTIVE">Active ({getStatusCount('ACTIVE')})</option>
                  <option value="PAUSED">Paused ({getStatusCount('PAUSED')})</option>
                  <option value="STOPPED">Stopped ({getStatusCount('STOPPED')})</option>
                  <option value="DRAFT">Draft ({getStatusCount('DRAFT')})</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                >
                  <option value="updated">Last Updated</option>
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                  <option value="performance">Performance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Order
                </label>
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full justify-start"
                >
                  {sortOrder === 'asc' ? (
                    <>
                      <SortAsc className="h-4 w-4 mr-2" />
                      Ascending
                    </>
                  ) : (
                    <>
                      <SortDesc className="h-4 w-4 mr-2" />
                      Descending
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-success-600" />
              <div>
                <div className="text-2xl font-bold text-success-900 dark:text-success-100">
                  {getStatusCount('ACTIVE')}
                </div>
                <div className="text-sm text-success-700 dark:text-success-300">Active</div>
              </div>
            </div>
          </div>

          <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Pause className="h-5 w-5 text-warning-600" />
              <div>
                <div className="text-2xl font-bold text-warning-900 dark:text-warning-100">
                  {getStatusCount('PAUSED')}
                </div>
                <div className="text-sm text-warning-700 dark:text-warning-300">Paused</div>
              </div>
            </div>
          </div>

          <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Square className="h-5 w-5 text-danger-600" />
              <div>
                <div className="text-2xl font-bold text-danger-900 dark:text-danger-100">
                  {getStatusCount('STOPPED')}
                </div>
                <div className="text-sm text-danger-700 dark:text-danger-300">Stopped</div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-neutral-600" />
              <div>
                <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {getStatusCount('DRAFT')}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Draft</div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategies Grid/List */}
        {strategiesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="ml-2 text-neutral-600 dark:text-neutral-400">Loading strategies...</span>
          </div>
        ) : filteredStrategies.length > 0 ? (
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          )}>
            {filteredStrategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                onEdit={(s) => handleStrategyAction('edit', s)}
                onClone={(s) => handleStrategyAction('clone', s)}
                onDelete={(s) => handleStrategyAction('delete', s)}
                onDeploy={(s) => handleStrategyAction('deploy', s)}
                onPause={(s) => handleStrategyAction('pause', s)}
                onStop={(s) => handleStrategyAction('stop', s)}
                className={viewMode === 'list' ? 'flex-row' : ''}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              No strategies found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first trading strategy to get started'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Strategy
              </Button>
            )}
          </div>
        )}

        {/* Create Strategy Modal */}
        <CreateStrategyModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateFromTemplate={handleCreateFromTemplate}
          onCreateFromScratch={handleCreateFromScratch}
          templates={uiTemplates}
        />
      </div>
    </MainLayout>
  );
}