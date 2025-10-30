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
  FileText
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button, Input } from '@/components/ui';
import { StrategyCard } from '@/components/features/strategies/strategy-card';
import { CreateStrategyModal } from '@/components/features/strategies/create-strategy-modal';
import { useAuthStore } from '@/stores/auth-store';
import { mockStrategies, mockStrategyTemplates } from '@/mocks/data/strategies';
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
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Load strategies from localStorage and mock data
  useEffect(() => {
    const savedStrategies = localStorage.getItem('user-strategies');
    const userStrategies = savedStrategies ? JSON.parse(savedStrategies) : [];
    
    // Convert date strings back to Date objects for user strategies
    const parsedUserStrategies = userStrategies.map((strategy: any) => ({
      ...strategy,
      createdAt: new Date(strategy.createdAt),
      updatedAt: new Date(strategy.updatedAt),
      deployedAt: strategy.deployedAt ? new Date(strategy.deployedAt) : undefined,
    }));
    
    // Combine user strategies with mock strategies
    setStrategies([...parsedUserStrategies, ...mockStrategies]);
  }, []);

  // Check if create modal should be opened from URL parameter
  useEffect(() => {
    const shouldCreate = searchParams.get('create');
    if (shouldCreate === 'true') {
      setShowCreateModal(true);
      // Clean up the URL parameter
      router.replace('/strategies');
    }
  }, [searchParams, router]);

  // Filter and sort strategies
  const filteredStrategies = useMemo(() => {
    const filtered = strategies.filter(strategy => {
      const matchesSearch = strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           strategy.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           strategy.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || strategy.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort strategies
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'updated':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'performance':
          const aPerf = a.performance?.totalReturnPercent || 0;
          const bPerf = b.performance?.totalReturnPercent || 0;
          comparison = aPerf - bPerf;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [strategies, searchQuery, statusFilter, sortField, sortOrder]);

  const handleCreateFromTemplate = (template: StrategyTemplate, name: string) => {
    const newStrategy: Strategy = {
      id: `strategy-${Date.now()}`,
      name,
      description: `Strategy based on ${template.name}`,
      type: 'TEMPLATE',
      status: 'DRAFT',
      parameters: { ...template.defaultParameters },
      templateId: template.id,
      isTemplate: false,
      tags: [template.category.toLowerCase().replace(' ', '-')],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Save to localStorage for persistence
    const savedStrategies = localStorage.getItem('user-strategies');
    const userStrategies = savedStrategies ? JSON.parse(savedStrategies) : [];
    userStrategies.unshift(newStrategy);
    localStorage.setItem('user-strategies', JSON.stringify(userStrategies));
    
    setStrategies(prev => [newStrategy, ...prev]);
    router.push(`/strategies/builder?id=${newStrategy.id}`);
  };

  const handleCreateFromScratch = (type: 'CODE' | 'VISUAL', name: string, description: string) => {
    const newStrategy: Strategy = {
      id: `strategy-${Date.now()}`,
      name,
      description: description || `Custom ${type.toLowerCase()} strategy`,
      type,
      status: 'DRAFT',
      parameters: {},
      isTemplate: false,
      tags: ['custom'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Save to localStorage for persistence
    const savedStrategies = localStorage.getItem('user-strategies');
    const userStrategies = savedStrategies ? JSON.parse(savedStrategies) : [];
    userStrategies.unshift(newStrategy);
    localStorage.setItem('user-strategies', JSON.stringify(userStrategies));
    
    setStrategies(prev => [newStrategy, ...prev]);
    router.push(`/strategies/builder?id=${newStrategy.id}`);
  };

  const handleStrategyAction = (action: string, strategy: Strategy) => {
    switch (action) {
      case 'edit':
        router.push(`/strategies/builder?id=${strategy.id}`);
        break;
      case 'clone':
        const clonedStrategy: Strategy = {
          ...strategy,
          id: `strategy-${Date.now()}`,
          name: `${strategy.name} (Copy)`,
          status: 'DRAFT',
          createdAt: new Date(),
          updatedAt: new Date(),
          deployedAt: undefined,
          performance: undefined,
        };
        
        // Save to localStorage
        const savedStrategies = localStorage.getItem('user-strategies');
        const userStrategies = savedStrategies ? JSON.parse(savedStrategies) : [];
        userStrategies.unshift(clonedStrategy);
        localStorage.setItem('user-strategies', JSON.stringify(userStrategies));
        
        setStrategies(prev => [clonedStrategy, ...prev]);
        break;
      case 'delete':
        setStrategies(prev => prev.filter(s => s.id !== strategy.id));
        break;
      case 'deploy':
      case 'pause':
      case 'stop':
        setStrategies(prev => prev.map(s => 
          s.id === strategy.id 
            ? { 
                ...s, 
                status: action === 'deploy' ? 'ACTIVE' : action === 'pause' ? 'PAUSED' : 'STOPPED',
                deployedAt: action === 'deploy' ? new Date() : s.deployedAt,
                updatedAt: new Date()
              }
            : s
        ));
        break;
    }
  };

  const getStatusCount = (status: StatusFilter) => {
    if (status === 'all') return strategies.length;
    return strategies.filter(s => s.status === status).length;
  };

  if (!user) {
    return null;
  }

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
        {filteredStrategies.length > 0 ? (
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
          templates={mockStrategyTemplates}
        />
      </div>
    </MainLayout>
  );
}