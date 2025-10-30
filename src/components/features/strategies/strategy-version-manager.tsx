'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  GitBranch, 
  Clock, 
  Tag, 
  MessageSquare,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import { Strategy } from '@/types/trading';
import { cn } from '@/lib/utils';

interface StrategyVersion {
  id: string;
  version: string;
  description: string;
  createdAt: Date;
  isActive: boolean;
  changes: string[];
}

interface StrategyVersionManagerProps {
  strategy: Strategy;
  onSave: (strategy: Strategy, version: StrategyVersion) => void;
  className?: string;
}

export function StrategyVersionManager({
  strategy,
  onSave,
  className,
}: StrategyVersionManagerProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [versionData, setVersionData] = useState({
    version: '',
    description: '',
  });
  const [versions] = useState<StrategyVersion[]>([
    {
      id: 'v1',
      version: '1.0.0',
      description: 'Initial version with basic MA crossover logic',
      createdAt: new Date('2024-01-15T10:30:00Z'),
      isActive: false,
      changes: ['Added onTick function', 'Implemented MA crossover logic', 'Added stop loss and take profit'],
    },
    {
      id: 'v2',
      version: '1.1.0',
      description: 'Improved risk management and added RSI filter',
      createdAt: new Date('2024-01-20T14:45:00Z'),
      isActive: true,
      changes: ['Added RSI filter', 'Improved position sizing', 'Enhanced error handling'],
    },
  ]);

  const handleSave = () => {
    if (!versionData.version.trim() || !versionData.description.trim()) {
      return;
    }

    const newVersion: StrategyVersion = {
      id: `v${Date.now()}`,
      version: versionData.version.trim(),
      description: versionData.description.trim(),
      createdAt: new Date(),
      isActive: true,
      changes: [], // In real implementation, this would be calculated
    };

    onSave(strategy, newVersion);
    setShowSaveModal(false);
    setVersionData({ version: '', description: '' });
  };

  const getNextVersion = () => {
    if (versions.length === 0) return '1.0.0';
    
    const latestVersion = versions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    
    const [major, minor, patch] = latestVersion.version.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GitBranch className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Version Management
          </h3>
        </div>
        
        <Button
          onClick={() => {
            setVersionData({ version: getNextVersion(), description: '' });
            setShowSaveModal(true);
          }}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Save Version</span>
        </Button>
      </div>

      {/* Version History */}
      <div className="space-y-3">
        {versions.map((version) => (
          <motion.div
            key={version.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'border rounded-lg p-4 transition-colors',
              version.isActive
                ? 'border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20'
                : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Tag className="h-4 w-4 text-neutral-500" />
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    v{version.version}
                  </span>
                  {version.isActive && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300 rounded">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  {version.description}
                </p>
                
                <div className="flex items-center space-x-4 text-xs text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{version.createdAt.toLocaleDateString()}</span>
                  </div>
                  {version.changes.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{version.changes.length} changes</span>
                    </div>
                  )}
                </div>
                
                {version.changes.length > 0 && (
                  <div className="mt-2">
                    <details className="text-sm">
                      <summary className="cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200">
                        View changes
                      </summary>
                      <ul className="mt-2 space-y-1 text-neutral-600 dark:text-neutral-400">
                        {version.changes.map((change, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span className="w-1 h-1 bg-neutral-400 rounded-full"></span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Save Version Modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        size="md"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              Save New Version
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Create a new version of your strategy with a description of changes.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Version Number"
              value={versionData.version}
              onChange={(e) => setVersionData(prev => ({ ...prev, version: e.target.value }))}
              placeholder="e.g., 1.2.0"
              required
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Description
              </label>
              <textarea
                value={versionData.description}
                onChange={(e) => setVersionData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the changes in this version..."
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowSaveModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!versionData.version.trim() || !versionData.description.trim()}
            >
              Save Version
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}