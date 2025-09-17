'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw,
  HardDrive,
  FileText,
  BarChart3
} from 'lucide-react';
import { useStorage } from '@/contexts/storage-context';

export function StorageManager() {
  const { storageManager, prompts, analyses } = useStorage();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = storageManager.exportData();
      if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `promptpilot-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsImporting(true);
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          const success = storageManager.importData(data);
          if (success) {
            // Refresh all data
            prompts.refresh();
            analyses.refresh();
          }
        } catch (error) {
          console.error('Import failed:', error);
        } finally {
          setIsImporting(false);
        }
      }
    };
    input.click();
  };

  const handleCleanup = async () => {
    setIsCleaning(true);
    try {
      const removedCount = storageManager.cleanup(30); // Remove items older than 30 days
      if (removedCount > 0) {
        prompts.refresh();
        analyses.refresh();
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    } finally {
      setIsCleaning(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    if (!storageManager.usageInfo) return 0;
    const maxSize = 5 * 1024 * 1024; // 5MB
    return (storageManager.usageInfo.totalSize / maxSize) * 100;
  };

  if (!storageManager.usageInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Loading storage information...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Overview
          </CardTitle>
          <CardDescription>
            Manage your local storage and data persistence
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Prompts</span>
              </div>
              <div className="text-2xl font-bold">{storageManager.usageInfo.promptsCount}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Analyses</span>
              </div>
              <div className="text-2xl font-bold">{storageManager.usageInfo.analysesCount}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Storage Used</span>
              </div>
              <div className="text-2xl font-bold">{formatBytes(storageManager.usageInfo.totalSize)}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage Usage</span>
              <span>{formatBytes(storageManager.usageInfo.totalSize)} / 5MB</span>
            </div>
            <Progress value={getStoragePercentage()} className="h-2" />
            {storageManager.usageInfo.isNearLimit && (
              <Alert>
                <AlertDescription>
                  Storage is approaching the limit. Consider cleaning up old data.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Export Data</CardTitle>
            <CardDescription>
              Download all your prompts and analyses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="w-full"
              variant="outline"
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Import Data</CardTitle>
            <CardDescription>
              Restore from a backup file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleImport} 
              disabled={isImporting}
              className="w-full"
              variant="outline"
            >
              {isImporting ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isImporting ? 'Importing...' : 'Import Data'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Cleanup</CardTitle>
            <CardDescription>
              Remove data older than 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleCleanup} 
              disabled={isCleaning}
              className="w-full"
              variant="outline"
            >
              {isCleaning ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {isCleaning ? 'Cleaning...' : 'Cleanup Old Data'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
