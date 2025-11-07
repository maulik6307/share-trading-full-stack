'use client';

import { useState } from 'react';
import { 
  Download, 
  FileText, 
  Share2, 
  Copy, 
  Check,
  X,
  FileSpreadsheet,
  FileImage
} from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';
import { useToast } from '@/components/ui';
import { BacktestResult, Strategy } from '@/types/trading';
import { 
  exportTradesToCSV, 
  exportBacktestSummaryToCSV,
  exportBacktestResultToJSON,
  exportChartAsImage,
  generateShareableReport,
  createShareableURL,
  copyToClipboard
} from '@/lib/utils/export-utils';
import { generateBacktestPDFReport } from '@/lib/utils/pdf-generator';
import { cn } from '@/lib/utils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: BacktestResult;
  strategy?: Strategy;
  chartRefs?: {
    equityCurve?: React.RefObject<HTMLDivElement>;
    drawdownChart?: React.RefObject<HTMLDivElement>;
    metricsChart?: React.RefObject<HTMLDivElement>;
  };
}

type ExportType = 'csv-trades' | 'csv-summary' | 'json-full' | 'pdf-report' | 'chart-image' | 'share-link';

interface ExportOption {
  id: ExportType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'data' | 'report' | 'visual' | 'share';
}

const exportOptions: ExportOption[] = [
  {
    id: 'csv-trades',
    title: 'Trade Data (CSV)',
    description: 'Export all trade details in spreadsheet format',
    icon: FileSpreadsheet,
    category: 'data'
  },
  {
    id: 'csv-summary',
    title: 'Summary Metrics (CSV)',
    description: 'Export performance metrics and statistics',
    icon: FileSpreadsheet,
    category: 'data'
  },
  {
    id: 'json-full',
    title: 'Complete Data (JSON)',
    description: 'Export full backtest result including charts data',
    icon: FileText,
    category: 'data'
  },
  {
    id: 'pdf-report',
    title: 'PDF Report',
    description: 'Generate comprehensive PDF report',
    icon: FileText,
    category: 'report'
  },
  {
    id: 'chart-image',
    title: 'Chart Images',
    description: 'Export charts as PNG images',
    icon: FileImage,
    category: 'visual'
  },
  {
    id: 'share-link',
    title: 'Shareable Link',
    description: 'Create a link to share results online',
    icon: Share2,
    category: 'share'
  }
];

export function ExportModal({ isOpen, onClose, result, strategy, chartRefs }: ExportModalProps) {
  const [selectedExports, setSelectedExports] = useState<Set<ExportType>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [shareableUrl, setShareableUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [exportProgress, setExportProgress] = useState<Partial<Record<ExportType, 'pending' | 'success' | 'error'>>>({});
  const { addToast } = useToast();

  const handleToggleExport = (exportId: ExportType) => {
    const newSelected = new Set(selectedExports);
    if (newSelected.has(exportId)) {
      newSelected.delete(exportId);
    } else {
      newSelected.add(exportId);
    }
    setSelectedExports(newSelected);
  };

  const handleSelectAll = (category?: string) => {
    if (category) {
      const categoryOptions = exportOptions.filter(opt => opt.category === category);
      const newSelected = new Set(selectedExports);
      categoryOptions.forEach(opt => newSelected.add(opt.id));
      setSelectedExports(newSelected);
    } else {
      setSelectedExports(new Set(exportOptions.map(opt => opt.id)));
    }
  };

  const handleClearAll = () => {
    setSelectedExports(new Set());
  };

  const executeExport = async (exportType: ExportType): Promise<void> => {
    const strategyName = strategy?.name || 'Unknown Strategy';
    const timestamp = new Date().toISOString().split('T')[0];

    switch (exportType) {
      case 'csv-trades':
        exportTradesToCSV(result.trades, {
          filename: `${strategyName}-trades-${timestamp}.csv`
        });
        break;

      case 'csv-summary':
        exportBacktestSummaryToCSV(result.summary, {
          filename: `${strategyName}-summary-${timestamp}.csv`
        });
        break;

      case 'json-full':
        exportBacktestResultToJSON(result, {
          filename: `${strategyName}-full-result-${timestamp}.json`
        });
        break;

      case 'pdf-report':
        await generateBacktestPDFReport(result, strategy, {
          filename: `${strategyName}-report-${timestamp}.pdf`,
          includeCharts: true,
          includeTrades: true,
          maxTrades: 50
        });
        break;

      case 'chart-image':
        const charts = [
          { ref: chartRefs?.equityCurve, name: 'equity-curve' },
          { ref: chartRefs?.drawdownChart, name: 'drawdown-chart' },
          { ref: chartRefs?.metricsChart, name: 'metrics-chart' }
        ];

        for (const chart of charts) {
          if (chart.ref?.current) {
            try {
              await exportChartAsImage(chart.ref.current, {
                filename: `${strategyName}-${chart.name}-${timestamp}.png`
              });
            } catch (error) {
              console.warn(`Failed to export ${chart.name}:`, error);
            }
          }
        }
        break;

      case 'share-link':
        const reportData = generateShareableReport(result, strategyName);
        const url = createShareableURL(reportData);
        setShareableUrl(url);
        break;

      default:
        throw new Error(`Unknown export type: ${exportType}`);
    }
  };

  const handleExport = async () => {
    if (selectedExports.size === 0) {
      addToast({
        type: 'warning',
        title: 'No exports selected',
        description: 'Please select at least one export option.'
      });
      return;
    }

    setIsExporting(true);
    const newProgress: Partial<Record<ExportType, 'pending' | 'success' | 'error'>> = {};
    
    // Initialize progress
    selectedExports.forEach(exportType => {
      newProgress[exportType] = 'pending';
    });
    setExportProgress(newProgress);

    let successCount = 0;
    let errorCount = 0;

    // Execute exports sequentially to avoid overwhelming the browser
    for (const exportType of Array.from(selectedExports)) {
      try {
        await executeExport(exportType);
        newProgress[exportType] = 'success';
        successCount++;
      } catch (error) {
        console.error(`Export failed for ${exportType}:`, error);
        newProgress[exportType] = 'error';
        errorCount++;
      }
      setExportProgress({ ...newProgress });
      
      // Small delay between exports
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsExporting(false);

    // Show summary toast
    if (errorCount === 0) {
      addToast({
        type: 'success',
        title: 'Export completed',
        description: `Successfully exported ${successCount} item${successCount !== 1 ? 's' : ''}.`
      });
    } else if (successCount > 0) {
      addToast({
        type: 'warning',
        title: 'Export partially completed',
        description: `${successCount} succeeded, ${errorCount} failed.`
      });
    } else {
      addToast({
        type: 'error',
        title: 'Export failed',
        description: 'All exports failed. Please try again.'
      });
    }
  };

  const handleCopyUrl = async () => {
    if (shareableUrl) {
      const success = await copyToClipboard(shareableUrl);
      if (success) {
        setCopiedUrl(true);
        addToast({
          type: 'success',
          title: 'Link copied',
          description: 'Shareable link copied to clipboard.'
        });
        setTimeout(() => setCopiedUrl(false), 2000);
      } else {
        addToast({
          type: 'error',
          title: 'Copy failed',
          description: 'Failed to copy link to clipboard.'
        });
      }
    }
  };

  const handleClose = () => {
    setSelectedExports(new Set());
    setShareableUrl('');
    setCopiedUrl(false);
    setExportProgress({});
    onClose();
  };

  const getStatusIcon = (exportType: ExportType) => {
    const status = exportProgress[exportType];
    if (status === 'success') {
      return <Check className="h-4 w-4 text-green-600" />;
    } else if (status === 'error') {
      return <X className="h-4 w-4 text-red-600" />;
    } else if (status === 'pending') {
      return <div className="h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />;
    }
    return null;
  };

  const categories = [
    { id: 'data', label: 'Data Exports', description: 'Raw data in various formats' },
    { id: 'report', label: 'Reports', description: 'Formatted reports and summaries' },
    { id: 'visual', label: 'Visual Exports', description: 'Charts and images' },
    { id: 'share', label: 'Sharing', description: 'Share results online' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6 max-h-128 max-w-full w-full overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Export Backtest Results
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {strategy?.name || 'Strategy'} • {result.summary.totalTrades} trades
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-6 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectAll()}
              disabled={isExporting}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={isExporting}
            >
              Clear All
            </Button>
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {selectedExports.size} selected
          </div>
        </div>

        {/* Export Options by Category */}
        <div className="space-y-6 mb-6">
          {categories.map(category => {
            const categoryOptions = exportOptions.filter(opt => opt.category === category.id);
            return (
              <div key={category.id}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-white">
                      {category.label}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {category.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectAll(category.id)}
                    disabled={isExporting}
                    className="text-xs"
                  >
                    Select All
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryOptions.map(option => {
                    const Icon = option.icon;
                    const isSelected = selectedExports.has(option.id);
                    const status = exportProgress[option.id];
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleToggleExport(option.id)}
                        disabled={isExporting}
                        className={cn(
                          'p-4 rounded-lg border text-left transition-all',
                          'hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed',
                          isSelected
                            ? 'border-primary-300 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/20'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={cn(
                              'p-2 rounded-lg',
                              isSelected 
                                ? 'bg-primary-100 dark:bg-primary-800' 
                                : 'bg-neutral-100 dark:bg-neutral-800'
                            )}>
                              <Icon className={cn(
                                'h-4 w-4',
                                isSelected 
                                  ? 'text-primary-600 dark:text-primary-400' 
                                  : 'text-neutral-600 dark:text-neutral-400'
                              )} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-medium text-neutral-900 dark:text-white">
                                {option.title}
                              </h4>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                                {option.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(option.id)}
                            <div className={cn(
                              'w-4 h-4 rounded border-2 flex items-center justify-center',
                              isSelected
                                ? 'border-primary-600 bg-primary-600'
                                : 'border-neutral-300 dark:border-neutral-600'
                            )}>
                              {isSelected && (
                                <Check className="h-2.5 w-2.5 text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Shareable URL Display */}
        {shareableUrl && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Shareable Link Generated
            </h4>
            <div className="flex items-center space-x-2">
              <Input
                value={shareableUrl}
                readOnly
                className="flex-1 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
                className="flex items-center space-x-1"
              >
                {copiedUrl ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isExporting}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleExport}
            disabled={selectedExports.size === 0 || isExporting}
            className="flex items-center space-x-2"
          >
            {isExporting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Export Selected ({selectedExports.size})</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}