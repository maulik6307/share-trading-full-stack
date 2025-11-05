// Export utilities for backtesting data and reports

import { BacktestResult, Trade, BacktestSummary } from '@/types/trading';

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: 'iso' | 'local' | 'short';
}

/**
 * Export trade data to CSV format
 */
export function exportTradesToCSV(trades: Trade[], options: ExportOptions = {}) {
  const {
    filename = `trades-${new Date().toISOString().split('T')[0]}.csv`,
    includeHeaders = true,
    dateFormat = 'local'
  } = options;

  const formatDate = (date: Date) => {
    switch (dateFormat) {
      case 'iso':
        return date.toISOString();
      case 'short':
        return date.toLocaleDateString();
      default:
        return date.toLocaleString();
    }
  };

  const headers = [
    'Trade ID',
    'Order ID', 
    'Strategy ID',
    'Symbol',
    'Side',
    'Quantity',
    'Price',
    'Commission',
    'P&L',
    'Executed At',
    'Tags'
  ];

  const rows = trades.map(trade => [
    trade.id,
    trade.orderId,
    trade.strategyId || '',
    trade.symbol,
    trade.side,
    trade.quantity.toString(),
    trade.price.toFixed(4),
    trade.commission.toFixed(2),
    trade.pnl.toFixed(2),
    formatDate(trade.executedAt),
    (trade.tags || []).join(';')
  ]);

  const csvData = includeHeaders ? [headers, ...rows] : rows;
  const csvContent = csvData.map(row => 
    row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export backtest summary to CSV format
 */
export function exportBacktestSummaryToCSV(summary: BacktestSummary, options: ExportOptions = {}) {
  const {
    filename = `backtest-summary-${new Date().toISOString().split('T')[0]}.csv`,
  } = options;

  const data = [
    ['Metric', 'Value'],
    ['Total Return', `$${summary.totalReturn.toLocaleString()}`],
    ['Total Return %', `${summary.totalReturnPercent.toFixed(2)}%`],
    ['Annualized Return %', `${summary.annualizedReturn.toFixed(2)}%`],
    ['Sharpe Ratio', summary.sharpeRatio.toFixed(2)],
    ['Sortino Ratio', summary.sortinoRatio.toFixed(2)],
    ['Max Drawdown', `$${Math.abs(summary.maxDrawdown).toLocaleString()}`],
    ['Max Drawdown %', `${summary.maxDrawdownPercent.toFixed(2)}%`],
    ['Max Drawdown Duration (days)', summary.maxDrawdownDuration.toString()],
    ['Volatility %', `${summary.volatility.toFixed(2)}%`],
    ['Win Rate %', `${(summary.winRate * 100).toFixed(1)}%`],
    ['Profit Factor', summary.profitFactor.toFixed(2)],
    ['Total Trades', summary.totalTrades.toString()],
    ['Winning Trades', summary.winningTrades.toString()],
    ['Losing Trades', summary.losingTrades.toString()],
    ['Average Win', `$${summary.avgWin.toFixed(2)}`],
    ['Average Loss', `$${summary.avgLoss.toFixed(2)}`],
    ['Largest Win', `$${summary.largestWin.toFixed(2)}`],
    ['Largest Loss', `$${summary.largestLoss.toFixed(2)}`],
    ['Average Trade Duration (days)', summary.avgTradeDuration.toFixed(1)],
    ['Final Capital', `$${summary.finalCapital.toLocaleString()}`],
    ['Total Commission', `$${summary.totalCommission.toFixed(2)}`],
    ['Total Slippage', `$${summary.totalSlippage.toFixed(2)}`],
  ];

  const csvContent = data.map(row => 
    row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Export complete backtest result to JSON format
 */
export function exportBacktestResultToJSON(result: BacktestResult, options: ExportOptions = {}) {
  const {
    filename = `backtest-result-${result.backtestId}.json`,
  } = options;

  const jsonContent = JSON.stringify(result, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

/**
 * Generate shareable report data
 */
export function generateShareableReport(result: BacktestResult, strategyName?: string) {
  const reportData = {
    id: `report-${Date.now()}`,
    strategyName: strategyName || 'Unknown Strategy',
    generatedAt: new Date().toISOString(),
    summary: {
      totalReturn: result.summary.totalReturn,
      totalReturnPercent: result.summary.totalReturnPercent,
      sharpeRatio: result.summary.sharpeRatio,
      maxDrawdownPercent: result.summary.maxDrawdownPercent,
      winRate: result.summary.winRate,
      totalTrades: result.summary.totalTrades,
      profitFactor: result.summary.profitFactor,
    },
    keyMetrics: [
      {
        label: 'Total Return',
        value: `${result.summary.totalReturnPercent.toFixed(2)}%`,
        subValue: `$${result.summary.totalReturn.toLocaleString()}`
      },
      {
        label: 'Sharpe Ratio',
        value: result.summary.sharpeRatio.toFixed(2),
        subValue: 'Risk-adjusted return'
      },
      {
        label: 'Max Drawdown',
        value: `${result.summary.maxDrawdownPercent.toFixed(2)}%`,
        subValue: `$${Math.abs(result.summary.maxDrawdown).toLocaleString()}`
      },
      {
        label: 'Win Rate',
        value: `${(result.summary.winRate * 100).toFixed(1)}%`,
        subValue: `${result.summary.winningTrades}/${result.summary.totalTrades} trades`
      }
    ],
    equityCurve: result.equityCurve.slice(0, 100), // Limit data for sharing
    tradeCount: result.trades.length,
    dateRange: {
      start: result.equityCurve[0]?.date,
      end: result.equityCurve[result.equityCurve.length - 1]?.date
    }
  };

  return reportData;
}

/**
 * Create shareable URL with encoded report data
 */
export function createShareableURL(reportData: any, baseUrl?: string) {
  const base = baseUrl || window.location.origin;
  const encodedData = btoa(JSON.stringify(reportData));
  return `${base}/shared-report?data=${encodedData}`;
}

/**
 * Export chart as image (requires canvas element)
 */
export async function exportChartAsImage(
  chartElement: HTMLElement, 
  options: { filename?: string; format?: 'png' | 'jpeg'; quality?: number } = {}
) {
  const {
    filename = `chart-${new Date().toISOString().split('T')[0]}.png`,
    format = 'png',
    quality = 0.9
  } = options;

  try {
    // Use html2canvas library if available, otherwise use native canvas API
    if (typeof window !== 'undefined' && (window as any).html2canvas) {
      const canvas = await (window as any).html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true
      });
      
      canvas.toBlob((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, `image/${format}`, quality);
    } else {
      // Fallback: try to find canvas element within the chart
      const canvas = chartElement.querySelector('canvas');
      if (canvas) {
        const dataURL = canvas.toDataURL(`image/${format}`, quality);
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('No canvas element found for chart export');
      }
    }
  } catch (error) {
    console.error('Error exporting chart:', error);
    throw new Error('Failed to export chart as image');
  }
}

/**
 * Utility function to download file
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}