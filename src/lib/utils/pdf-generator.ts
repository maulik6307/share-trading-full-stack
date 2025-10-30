// PDF generation utilities for backtest reports

import { BacktestResult, Strategy } from '@/types/trading';

export interface PDFReportOptions {
  filename?: string;
  includeCharts?: boolean;
  includeTrades?: boolean;
  maxTrades?: number;
  logoUrl?: string;
  companyName?: string;
}

/**
 * Generate PDF report for backtest results
 * Note: This is a mock implementation that generates HTML content
 * In a real application, you would use a library like jsPDF or Puppeteer
 */
export async function generateBacktestPDFReport(
  result: BacktestResult,
  strategy?: Strategy,
  options: PDFReportOptions = {}
) {
  const {
    filename = `backtest-report-${result.backtestId}.pdf`,
    includeCharts = true,
    includeTrades = true,
    maxTrades = 100,
    companyName = 'ShareTrading Platform'
  } = options;

  try {
    // Generate HTML content for the PDF
    const htmlContent = generateReportHTML(result, strategy, options);
    
    // In a real implementation, you would use a PDF library here
    // For now, we'll create a mock PDF by opening the HTML in a new window
    // and prompting the user to print/save as PDF
    
    if (typeof window !== 'undefined') {
      // Create a new window with the report content
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load, then trigger print dialog
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      }
    }
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw new Error('Failed to generate PDF report');
  }
}

/**
 * Generate HTML content for PDF report
 */
function generateReportHTML(
  result: BacktestResult,
  strategy?: Strategy,
  options: PDFReportOptions = {}
): string {
  const { companyName = 'ShareTrading Platform', includeTrades = true, maxTrades = 100 } = options;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const isPositiveReturn = result.summary.totalReturnPercent > 0;
  const tradesForReport = includeTrades ? result.trades.slice(0, maxTrades) : [];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Backtest Report - ${strategy?.name || 'Strategy'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .report-title {
            font-size: 32px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .report-subtitle {
            font-size: 18px;
            color: #6b7280;
            margin-bottom: 5px;
        }
        
        .report-date {
            font-size: 14px;
            color: #9ca3af;
        }
        
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .metric-card {
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #f9fafb;
        }
        
        .metric-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 2px;
        }
        
        .metric-subvalue {
            font-size: 12px;
            color: #6b7280;
        }
        
        .positive { color: #059669; }
        .negative { color: #dc2626; }
        .neutral { color: #1f2937; }
        
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .summary-table th,
        .summary-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .summary-table th {
            background: #f3f4f6;
            font-weight: 600;
            color: #374151;
        }
        
        .trades-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }
        
        .trades-table th,
        .trades-table td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .trades-table th {
            background: #f3f4f6;
            font-weight: 600;
            color: #374151;
        }
        
        .trades-table .number {
            text-align: right;
        }
        
        .side-buy {
            background: #dcfce7;
            color: #166534;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
        }
        
        .side-sell {
            background: #fee2e2;
            color: #991b1b;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
        }
        
        @media print {
            body { padding: 0; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">${companyName}</div>
        <h1 class="report-title">Backtest Report</h1>
        <div class="report-subtitle">${strategy?.name || 'Strategy Analysis'}</div>
        <div class="report-date">Generated on ${formatDate(new Date())}</div>
    </div>

    <div class="section">
        <h2 class="section-title">Executive Summary</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Total Return</div>
                <div class="metric-value ${isPositiveReturn ? 'positive' : 'negative'}">
                    ${result.summary.totalReturnPercent.toFixed(2)}%
                </div>
                <div class="metric-subvalue">${formatCurrency(result.summary.totalReturn)}</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-label">Sharpe Ratio</div>
                <div class="metric-value ${result.summary.sharpeRatio >= 1 ? 'positive' : 'neutral'}">
                    ${result.summary.sharpeRatio.toFixed(2)}
                </div>
                <div class="metric-subvalue">Risk-adjusted return</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-label">Max Drawdown</div>
                <div class="metric-value negative">
                    ${result.summary.maxDrawdownPercent.toFixed(2)}%
                </div>
                <div class="metric-subvalue">${formatCurrency(Math.abs(result.summary.maxDrawdown))}</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-label">Win Rate</div>
                <div class="metric-value ${result.summary.winRate >= 0.5 ? 'positive' : 'negative'}">
                    ${(result.summary.winRate * 100).toFixed(1)}%
                </div>
                <div class="metric-subvalue">${result.summary.winningTrades}/${result.summary.totalTrades} trades</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Performance Metrics</h2>
        <table class="summary-table">
            <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Description</th>
            </tr>
            <tr>
                <td>Annualized Return</td>
                <td class="${result.summary.annualizedReturn >= 0 ? 'positive' : 'negative'}">
                    ${result.summary.annualizedReturn.toFixed(2)}%
                </td>
                <td>Expected annual return</td>
            </tr>
            <tr>
                <td>Volatility</td>
                <td>${result.summary.volatility.toFixed(2)}%</td>
                <td>Annual price volatility</td>
            </tr>
            <tr>
                <td>Sortino Ratio</td>
                <td>${result.summary.sortinoRatio.toFixed(2)}</td>
                <td>Downside risk-adjusted return</td>
            </tr>
            <tr>
                <td>Profit Factor</td>
                <td class="${result.summary.profitFactor >= 1 ? 'positive' : 'negative'}">
                    ${result.summary.profitFactor.toFixed(2)}
                </td>
                <td>Gross profit / Gross loss</td>
            </tr>
            <tr>
                <td>Max Drawdown Duration</td>
                <td>${result.summary.maxDrawdownDuration} days</td>
                <td>Longest drawdown period</td>
            </tr>
            <tr>
                <td>Average Trade Duration</td>
                <td>${result.summary.avgTradeDuration.toFixed(1)} days</td>
                <td>Average holding period</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2 class="section-title">Trade Analysis</h2>
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Average Win</div>
                <div class="metric-value positive">${formatCurrency(result.summary.avgWin)}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Average Loss</div>
                <div class="metric-value negative">${formatCurrency(result.summary.avgLoss)}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Largest Win</div>
                <div class="metric-value positive">${formatCurrency(result.summary.largestWin)}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Largest Loss</div>
                <div class="metric-value negative">${formatCurrency(result.summary.largestLoss)}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Cost Analysis</h2>
        <table class="summary-table">
            <tr>
                <th>Cost Type</th>
                <th>Amount</th>
                <th>Impact on Returns</th>
            </tr>
            <tr>
                <td>Total Commission</td>
                <td>${formatCurrency(result.summary.totalCommission)}</td>
                <td>${((result.summary.totalCommission / result.summary.finalCapital) * 100).toFixed(2)}%</td>
            </tr>
            <tr>
                <td>Total Slippage</td>
                <td>${formatCurrency(result.summary.totalSlippage)}</td>
                <td>${((result.summary.totalSlippage / result.summary.finalCapital) * 100).toFixed(2)}%</td>
            </tr>
            <tr>
                <td><strong>Total Costs</strong></td>
                <td><strong>${formatCurrency(result.summary.totalCommission + result.summary.totalSlippage)}</strong></td>
                <td><strong>${(((result.summary.totalCommission + result.summary.totalSlippage) / result.summary.finalCapital) * 100).toFixed(2)}%</strong></td>
            </tr>
        </table>
    </div>

    ${includeTrades && tradesForReport.length > 0 ? `
    <div class="section">
        <h2 class="section-title">Trade History ${result.trades.length > maxTrades ? `(First ${maxTrades} trades)` : ''}</h2>
        <table class="trades-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Symbol</th>
                    <th>Side</th>
                    <th class="number">Quantity</th>
                    <th class="number">Price</th>
                    <th class="number">P&L</th>
                    <th class="number">Commission</th>
                </tr>
            </thead>
            <tbody>
                ${tradesForReport.map(trade => `
                <tr>
                    <td>${formatDateTime(trade.executedAt)}</td>
                    <td>${trade.symbol}</td>
                    <td><span class="side-${trade.side.toLowerCase()}">${trade.side}</span></td>
                    <td class="number">${trade.quantity.toLocaleString()}</td>
                    <td class="number">${formatCurrency(trade.price)}</td>
                    <td class="number ${trade.pnl >= 0 ? 'positive' : 'negative'}">${formatCurrency(trade.pnl)}</td>
                    <td class="number">${formatCurrency(trade.commission)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ${result.trades.length > maxTrades ? `
        <p style="margin-top: 10px; font-size: 12px; color: #6b7280;">
            Showing ${maxTrades} of ${result.trades.length} total trades. 
            Export full trade data as CSV for complete history.
        </p>
        ` : ''}
    </div>
    ` : ''}

    <div class="footer">
        <p>This report was generated by ${companyName} on ${formatDateTime(new Date())}</p>
        <p>Backtest ID: ${result.backtestId} | Strategy: ${strategy?.name || 'Unknown'}</p>
    </div>
</body>
</html>
  `;
}

/**
 * Generate a simplified PDF report summary
 */
export function generateQuickPDFSummary(result: BacktestResult, strategy?: Strategy) {
  const summary = {
    strategyName: strategy?.name || 'Unknown Strategy',
    totalReturn: result.summary.totalReturnPercent,
    sharpeRatio: result.summary.sharpeRatio,
    maxDrawdown: result.summary.maxDrawdownPercent,
    winRate: result.summary.winRate * 100,
    totalTrades: result.summary.totalTrades,
    generatedAt: new Date().toISOString()
  };

  return summary;
}