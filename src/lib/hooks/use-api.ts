// React Query hooks for API integration

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';

import { mockApiService, ApiResponse, PaginatedResponse, ApiError } from '@/mocks/services/api-service';
import { User } from '@/types/user';
import { 
  Symbol,
  MarketData,
  Order,
  Position,
  Strategy,
  StrategyTemplate,
  Backtest,
  BacktestResult,
  Portfolio,
  Alert,
  Watchlist,
} from '@/types/trading';

// Query keys for consistent caching
export const queryKeys = {
  user: ['user'] as const,
  symbols: ['symbols'] as const,
  marketData: (symbols?: string[]) => ['marketData', symbols] as const,
  symbolData: (symbol: string) => ['symbolData', symbol] as const,
  orders: (params?: any) => ['orders', params] as const,
  positions: ['positions'] as const,
  portfolio: ['portfolio'] as const,
  strategies: ['strategies'] as const,
  strategy: (id: string) => ['strategy', id] as const,
  strategyTemplates: ['strategyTemplates'] as const,
  backtests: (strategyId?: string) => ['backtests', strategyId] as const,
  backtestResult: (backtestId: string) => ['backtestResult', backtestId] as const,
  alerts: (params?: any) => ['alerts', params] as const,
  watchlists: ['watchlists'] as const,
};

// User hooks
export function useUser(options?: UseQueryOptions<ApiResponse<User>, ApiError>) {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => mockApiService.getUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updates: Partial<User>) => mockApiService.updateUser(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
}

// Symbols and Market Data hooks
export function useSymbols(options?: UseQueryOptions<ApiResponse<Symbol[]>, ApiError>) {
  return useQuery({
    queryKey: queryKeys.symbols,
    queryFn: () => mockApiService.getSymbols(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

export function useMarketData(
  symbols?: string[], 
  options?: UseQueryOptions<ApiResponse<MarketData[]>, ApiError>
) {
  return useQuery({
    queryKey: queryKeys.marketData(symbols),
    queryFn: () => mockApiService.getMarketData(symbols),
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 2000, // Consider stale after 2 seconds
    ...options,
  });
}

export function useSymbolData(
  symbol: string,
  options?: UseQueryOptions<ApiResponse<MarketData>, ApiError>
) {
  return useQuery({
    queryKey: queryKeys.symbolData(symbol),
    queryFn: () => mockApiService.getSymbolData(symbol),
    refetchInterval: 3000, // Refetch every 3 seconds
    staleTime: 1000, // Consider stale after 1 second
    enabled: !!symbol,
    ...options,
  });
}

// Orders hooks
export function useOrders(
  params?: {
    status?: Order['status'];
    symbol?: string;
    strategyId?: string;
    page?: number;
    limit?: number;
  },
  options?: UseQueryOptions<PaginatedResponse<Order>, ApiError>
) {
  return useQuery({
    queryKey: queryKeys.orders(params),
    queryFn: () => mockApiService.getOrders(params),
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider stale after 5 seconds
    ...options,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'filledQuantity' | 'remainingQuantity'>) => 
      mockApiService.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderId: string) => mockApiService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
    },
  });
}

// Positions hooks
export function usePositions(options?: UseQueryOptions<ApiResponse<Position[]>, ApiError>) {
  return useQuery({
    queryKey: queryKeys.positions,
    queryFn: () => mockApiService.getPositions(),
    refetchInterval: 15000, // Refetch every 15 seconds
    staleTime: 10000, // Consider stale after 10 seconds
    ...options,
  });
}

export function usePortfolio(options?: UseQueryOptions<ApiResponse<Portfolio>, ApiError>) {
  return useQuery({
    queryKey: queryKeys.portfolio,
    queryFn: () => mockApiService.getPortfolio(),
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider stale after 5 seconds
    ...options,
  });
}

// Strategies hooks
export function useStrategies(options?: UseQueryOptions<ApiResponse<Strategy[]>, ApiError>) {
  return useQuery({
    queryKey: queryKeys.strategies,
    queryFn: () => mockApiService.getStrategies(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

export function useStrategy(
  id: string,
  options?: UseQueryOptions<ApiResponse<Strategy>, ApiError>
) {
  return useQuery({
    queryKey: queryKeys.strategy(id),
    queryFn: () => mockApiService.getStrategy(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
    ...options,
  });
}

export function useCreateStrategy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (strategyData: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>) => 
      mockApiService.createStrategy(strategyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.strategies });
    },
  });
}

export function useUpdateStrategy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Strategy> }) => 
      mockApiService.updateStrategy(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.strategies });
      queryClient.invalidateQueries({ queryKey: queryKeys.strategy(variables.id) });
    },
  });
}

export function useDeleteStrategy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mockApiService.deleteStrategy(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.strategies });
      queryClient.removeQueries({ queryKey: queryKeys.strategy(id) });
    },
  });
}

export function useStrategyTemplates(options?: UseQueryOptions<ApiResponse<StrategyTemplate[]>, ApiError>) {
  return useQuery({
    queryKey: queryKeys.strategyTemplates,
    queryFn: () => mockApiService.getStrategyTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

// Backtests hooks
export function useBacktests(
  strategyId?: string,
  options?: UseQueryOptions<ApiResponse<Backtest[]>, ApiError>
) {
  return useQuery({
    queryKey: queryKeys.backtests(strategyId),
    queryFn: () => mockApiService.getBacktests(strategyId),
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  });
}

export function useCreateBacktest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (backtestData: Omit<Backtest, 'id' | 'createdAt' | 'progress' | 'status'>) => 
      mockApiService.createBacktest(backtestData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backtests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.backtests(variables.strategyId) });
    },
  });
}

export function useBacktestResult(
  backtestId: string,
  options?: UseQueryOptions<ApiResponse<BacktestResult>, ApiError>
) {
  return useQuery({
    queryKey: queryKeys.backtestResult(backtestId),
    queryFn: () => mockApiService.getBacktestResult(backtestId),
    enabled: !!backtestId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Alerts hooks
export function useAlerts(
  params?: { isRead?: boolean; type?: Alert['type'] },
  options?: UseQueryOptions<ApiResponse<Alert[]>, ApiError>
) {
  return useQuery({
    queryKey: queryKeys.alerts(params),
    queryFn: () => mockApiService.getAlerts(params),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider stale after 15 seconds
    ...options,
  });
}

export function useMarkAlertAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (alertId: string) => mockApiService.markAlertAsRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

// Watchlists hooks
export function useWatchlists(options?: UseQueryOptions<ApiResponse<Watchlist[]>, ApiError>) {
  return useQuery({
    queryKey: queryKeys.watchlists,
    queryFn: () => mockApiService.getWatchlists(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

export function useUpdateWatchlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Watchlist> }) => 
      mockApiService.updateWatchlist(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlists });
    },
  });
}

// Utility hooks for common patterns
export function useRefreshData() {
  const queryClient = useQueryClient();
  
  const refreshAll = () => {
    queryClient.invalidateQueries();
  };
  
  const refreshMarketData = () => {
    queryClient.invalidateQueries({ queryKey: ['marketData'] });
  };
  
  const refreshPortfolio = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
    queryClient.invalidateQueries({ queryKey: queryKeys.positions });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };
  
  const refreshStrategies = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.strategies });
  };
  
  return {
    refreshAll,
    refreshMarketData,
    refreshPortfolio,
    refreshStrategies,
  };
}