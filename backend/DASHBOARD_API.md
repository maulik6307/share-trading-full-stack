# Dashboard API Documentation

This document describes the Dashboard API endpoints for the ShareTrading platform.

## Base URL
```
http://localhost:5000/api/v1/dashboard
```

## Authentication
All dashboard endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints Overview

### 1. Get Complete Dashboard Data
**GET** `/`

Returns all dashboard data in a single request for optimal performance.

**Query Parameters:**
- `includePerformance` (boolean, default: true) - Include performance chart data
- `includeActivities` (boolean, default: true) - Include recent activities
- `includeAlerts` (boolean, default: true) - Include alerts
- `performanceDays` (integer, 1-365, default: 30) - Days of performance data
- `activitiesLimit` (integer, 1-100, default: 10) - Number of activities to return
- `alertsLimit` (integer, 1-100, default: 10) - Number of alerts to return

**Example Request:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/v1/dashboard?performanceDays=30&activitiesLimit=5"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "portfolio": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Main Portfolio",
      "totalValue": 112450,
      "currency": "USD",
      "lastUpdated": "2024-01-15T10:30:00.000Z"
    },
    "kpi": {
      "portfolioValue": {
        "current": 112450,
        "change": {
          "value": 2.4,
          "period": "today",
          "isPositive": true
        }
      },
      "roi30d": {
        "current": 12.4,
        "change": {
          "value": 1.2,
          "period": "vs last month",
          "isPositive": true
        }
      },
      "activeStrategies": {
        "current": 5,
        "profitable": 3,
        "description": "3 profitable"
      },
      "openPositions": {
        "current": 12,
        "profitable": 8,
        "description": "8 in profit"
      },
      "totalReturn": {
        "current": 12450,
        "change": {
          "value": 12.45,
          "period": "all time",
          "isPositive": true
        }
      },
      "winRate": {
        "current": 68.5,
        "change": {
          "value": 2.1,
          "period": "30d avg",
          "isPositive": true
        }
      }
    },
    "performance": [
      {
        "date": "2024-01-01",
        "value": 100000,
        "benchmark": 100000
      }
    ],
    "activities": [...],
    "alerts": [...]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get KPI Data Only
**GET** `/kpi`

Returns only the KPI card data for faster updates.

**Response:**
```json
{
  "success": true,
  "data": {
    "portfolioValue": { ... },
    "roi30d": { ... },
    "activeStrategies": { ... },
    "openPositions": { ... },
    "totalReturn": { ... },
    "winRate": { ... }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Get Performance Chart Data
**GET** `/performance`

Returns portfolio performance data for charts.

**Query Parameters:**
- `days` (integer, 1-365, default: 30) - Number of days of data

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "value": 100000,
      "benchmark": 100000
    },
    {
      "date": "2024-01-02",
      "value": 101200,
      "benchmark": 100800
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Get Recent Activities
**GET** `/activities`

Returns recent trading and system activities.

**Query Parameters:**
- `limit` (integer, 1-100, default: 10) - Number of activities to return
- `offset` (integer, default: 0) - Pagination offset
- `type` (string) - Filter by activity type: `trade`, `strategy`, `alert`, `system`, `deposit`, `withdrawal`
- `status` (string) - Filter by status: `success`, `warning`, `error`, `info`, `pending`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "trade",
      "action": "sell",
      "title": "Position Closed",
      "description": "Sold AAPL position with +5.2% profit",
      "status": "success",
      "symbol": "AAPL",
      "amount": 2840,
      "quantity": 20,
      "price": 182.30,
      "timestamp": "2024-01-15T09:45:00.000Z",
      "metadata": {
        "profit": 284
      }
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Get Alerts
**GET** `/alerts`

Returns active alerts and notifications.

**Query Parameters:**
- `limit` (integer, 1-100, default: 10) - Number of alerts to return
- `offset` (integer, default: 0) - Pagination offset
- `type` (string) - Filter by alert type: `info`, `warning`, `error`, `success`
- `priority` (string) - Filter by priority: `low`, `medium`, `high`, `critical`
- `unreadOnly` (boolean, default: false) - Return only unread alerts

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "warning",
      "category": "risk",
      "title": "High Volatility Detected",
      "message": "NVDA showing unusual price movements. Consider reviewing position size.",
      "priority": "high",
      "isRead": false,
      "isActionable": true,
      "symbol": "NVDA",
      "timestamp": "2024-01-15T09:30:00.000Z",
      "metadata": {
        "volatility": 15.2
      }
    }
  ],
  "meta": {
    "unreadCount": 3
  },
  "pagination": {
    "total": 12,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6. Get Dashboard Stats Summary
**GET** `/stats`

Returns quick stats for dashboard header or notifications.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalActivities": 45,
    "unreadAlerts": 3,
    "portfolioValue": 112450,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 7. Mark Alert as Read
**PUT** `/alerts/:id/read`

Marks a specific alert as read.

**Response:**
```json
{
  "success": true,
  "message": "Alert marked as read",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "isRead": true
  }
}
```

### 8. Dismiss Alert
**DELETE** `/alerts/:id`

Dismisses (soft deletes) a specific alert.

**Response:**
```json
{
  "success": true,
  "message": "Alert dismissed"
}
```

## Data Models

### Portfolio
```typescript
interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  currency: string;
  lastUpdated: string;
}
```

### KPI Data
```typescript
interface KPIData {
  portfolioValue: KPIMetric;
  roi30d: KPIMetric;
  activeStrategies: StrategyMetric;
  openPositions: PositionMetric;
  totalReturn: KPIMetric;
  winRate: KPIMetric;
}

interface KPIMetric {
  current: number;
  change: {
    value: number;
    period: string;
    isPositive: boolean;
  };
}

interface StrategyMetric {
  current: number;
  profitable: number;
  description: string;
}

interface PositionMetric {
  current: number;
  profitable: number;
  description: string;
}
```

### Performance Data
```typescript
interface PerformanceData {
  date: string; // YYYY-MM-DD format
  value: number;
  benchmark: number;
}
```

### Activity
```typescript
interface Activity {
  _id: string;
  type: 'trade' | 'strategy' | 'alert' | 'system' | 'deposit' | 'withdrawal';
  action: string;
  title: string;
  description: string;
  status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  symbol?: string;
  amount?: number;
  quantity?: number;
  price?: number;
  timestamp: string;
  metadata: Record<string, any>;
}
```

### Alert
```typescript
interface Alert {
  _id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'risk' | 'performance' | 'position' | 'strategy' | 'system' | 'market';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  isActionable: boolean;
  symbol?: string;
  timestamp: string;
  metadata: Record<string, any>;
}
```

## Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

## Performance Considerations

1. **Caching**: KPI and performance data are cached for 1 minute
2. **Pagination**: Use `limit` and `offset` for large datasets
3. **Selective Loading**: Use query parameters to load only needed data
4. **Indexes**: All queries are optimized with proper database indexes

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Higher limits for authenticated users

## WebSocket Support (Future)

Real-time updates will be available via WebSocket for:
- Live portfolio value updates
- New alerts
- Activity feed updates
- Position changes

## Testing

Use the seeding script to populate test data:
```bash
node seed-dashboard.js <userId>
```

## Integration Examples

### React Hook Example
```typescript
const useDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/v1/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { data, loading };
};
```

### Incremental Updates
```typescript
// Update only KPI data
const updateKPI = async () => {
  const response = await fetch('/api/v1/dashboard/kpi');
  const result = await response.json();
  setKPIData(result.data);
};

// Update only alerts
const updateAlerts = async () => {
  const response = await fetch('/api/v1/dashboard/alerts?unreadOnly=true');
  const result = await response.json();
  setAlerts(result.data);
};
```