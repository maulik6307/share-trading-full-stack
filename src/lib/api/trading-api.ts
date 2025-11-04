import { apiClient } from '@/lib/api/client';
import { Order, Position, Portfolio, MarketData } from '@/types/trading';
import { transformDates } from '@/lib/utils/date-transform';

export interface PlaceOrderRequest {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
    quantity: number;
    price?: number;
    stopPrice?: number;
    strategyId?: string;
}

export interface OrdersResponse {
    orders: Order[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface ClosePositionRequest {
    quantity?: number;
}

export interface SetStopLossRequest {
    stopPrice: number;
}

export interface SetTakeProfitRequest {
    targetPrice: number;
}

export interface ModifyOrderRequest {
    price?: number;
    quantity?: number;
    stopPrice?: number;
}

class TradingAPI {
    // Portfolio endpoints
    async getPortfolio(): Promise<Portfolio> {
        const response = await apiClient.get('/trading/portfolio');
        return transformDates(response.data);
    }

    // Position endpoints
    async getPositions(): Promise<Position[]> {
        const response = await apiClient.get('/trading/positions');
        return transformDates(response.data);
    }

    async closePosition(positionId: string, data: ClosePositionRequest): Promise<{
        position: Position;
        trade: any;
        pnl: number;
    }> {
        const response = await apiClient.post(`/trading/positions/${positionId}/close`, data);
        return response.data;
    }

    async setStopLoss(positionId: string, data: SetStopLossRequest): Promise<Position> {
        const response = await apiClient.post(`/trading/positions/${positionId}/stop-loss`, data);
        return response.data;
    }

    async setTakeProfit(positionId: string, data: SetTakeProfitRequest): Promise<Position> {
        const response = await apiClient.post(`/trading/positions/${positionId}/take-profit`, data);
        return response.data;
    }

    async exportPositions(): Promise<Blob> {
        const response = await apiClient.get('/trading/positions/export', {
            responseType: 'blob'
        });
        return response.data;
    }

    // Order endpoints
    async placeOrder(data: PlaceOrderRequest): Promise<Order> {
        const response = await apiClient.post('/trading/orders', data);
        return transformDates(response.data);
    }

    async getOrders(params?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<OrdersResponse> {
        const response = await apiClient.get('/trading/orders', { params });
        const data = response.data;
        return {
            ...data,
            orders: transformDates(data.orders)
        };
    }

    async getActiveOrders(): Promise<Order[]> {
        const response = await apiClient.get('/trading/orders/active');
        return transformDates(response.data);
    }

    async cancelOrder(orderId: string): Promise<Order> {
        const response = await apiClient.delete(`/trading/orders/${orderId}`);
        return response.data;
    }

    async modifyOrder(orderId: string, data: ModifyOrderRequest): Promise<Order> {
        const response = await apiClient.put(`/trading/orders/${orderId}`, data);
        return response.data;
    }

    async exportOrders(): Promise<Blob> {
        const response = await apiClient.get('/trading/orders/export', {
            responseType: 'blob'
        });
        return response.data;
    }

    // Market data endpoints
    async getMarketData(symbols?: string[]): Promise<MarketData[]> {
        const params = symbols ? { symbols: symbols.join(',') } : {};
        const response = await apiClient.get('/trading/market-data', { params });
        return response.data;
    }

    async getSymbolData(symbol: string): Promise<MarketData> {
        const response = await apiClient.get(`/trading/market-data/${symbol}`);
        return response.data;
    }

    async getHistoricalData(
        symbol: string,
        startDate?: string,
        endDate?: string,
        interval?: string
    ): Promise<MarketData[]> {
        const params = { startDate, endDate, interval };
        const response = await apiClient.get(`/trading/market-data/${symbol}/history`, { params });
        return response.data;
    }

    async getOHLCData(
        symbol: string,
        period?: string,
        count?: number
    ): Promise<Array<{
        date: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
    }>> {
        const params = { period, count };
        const response = await apiClient.get(`/trading/market-data/${symbol}/ohlc`, { params });
        return response.data;
    }
}

export const tradingAPI = new TradingAPI();