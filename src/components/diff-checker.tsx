'use client';
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Split, FileText, Copy } from 'lucide-react';
interface DiffLine {
  type: 'unchanged' | 'added' | 'removed';
  content: string;
  lineNumber?: number;
}
interface DiffCheckerProps {
  originalText: string;
  improvedText: string;
  title?: string;
}
export function DiffChecker({ originalText, improvedText, title = "Text Comparison" }: DiffCheckerProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  // Simple line-by-line diff algorithm
  const originalLines = useMemo(() => originalText.split('\n'), [originalText]);
  const improvedLines = useMemo(() => improvedText.split('\n'), [improvedText]);

  const diff = useMemo(() => {
    const result: DiffLine[] = [];
    const maxLines = Math.max(originalLines.length, improvedLines.length);
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const improvedLine = improvedLines[i] || '';
      if (i >= originalLines.length) {
        result.push({ type: 'added', content: improvedLine });
      } else if (i >= improvedLines.length) {
        result.push({ type: 'removed', content: originalLine });
      } else if (originalLine === improvedLine) {
        result.push({ type: 'unchanged', content: originalLine });
      } else {
        if (originalLine.trim() !== '') {
          result.push({ type: 'removed', content: originalLine });
        }
        if (improvedLine.trim() !== '') {
          result.push({ type: 'added', content: improvedLine });
        }
      }
    }
    return result;
  }, [originalLines, improvedLines]);
  // Create separate arrays for left and right sides (memoized)
  const leftSide = useMemo(() => diff.map((line, index) => ({
    ...line,
    index,
    show: line.type === 'removed' || line.type === 'unchanged'
  })), [diff]);
  const rightSide = useMemo(() => diff.map((line, index) => ({
    ...line,
    index,
    show: line.type === 'added' || line.type === 'unchanged'
  })), [diff]);
  const renderDiffLine = (line: DiffLine, index: number, showLineNumbers = false) => {
    const baseClasses = "px-2 py-1 text-sm";
    const lineNumber = showLineNumbers ? `${index + 1}`.padStart(3, ' ') : '';
    switch (line.type) {
      case 'unchanged':
        return (
          <span key={index} className={`${baseClasses} text-foreground`}>
            {showLineNumbers && <span className="text-muted-foreground mr-2 select-none">{lineNumber}</span>}
            {line.content}
          </span>
        );
      case 'added':
        return (
          <span key={index} className={`${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-medium`}>
            {showLineNumbers && <span className="text-green-600 mr-2 select-none">{lineNumber}</span>}
            {line.content}
          </span>
        );
      case 'removed':
        return (
          <span key={index} className={`${baseClasses} bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 font-medium`}>
            {showLineNumbers && <span className="text-red-600 mr-2 select-none">{lineNumber}</span>}
            {line.content}
          </span>
        );
      default:
        return null;
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded"></div>
                <span className="text-green-800 dark:text-green-200">Added/Improved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded"></div>
                <span className="text-red-800 dark:text-red-200">Removed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded"></div>
                <span className="text-gray-600 dark:text-gray-400">Unchanged</span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'side-by-side' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('side-by-side')}
                className="flex items-center gap-2"
              >
                <Split className="h-4 w-4" />
                Side by Side
              </Button>
              <Button
                variant={viewMode === 'unified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('unified')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Unified
              </Button>
            </div>
          </div>
          {/* Conditional rendering based on view mode */}
          {viewMode === 'side-by-side' ? (
            /* Side by side comparison */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Original Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Original Text
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(originalText);
                    }}
                    className="h-6 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="p-4 border-2 border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10 min-h-[300px] font-mono">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {originalLines.map((line, index) => (
                      <div key={index} className="px-2 py-1 text-sm block w-full">
                        {line || ' '}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Improved Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Improved Text
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(improvedText);
                    }}
                    className="h-6 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="p-4 border-2 border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/10 min-h-[300px] font-mono">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {improvedLines.map((line, index) => {
                      const originalLine = originalLines[index] || '';
                      const isChanged = line !== originalLine;
                      const isNew = index >= originalLines.length;
                      return (
                        <div
                          key={index}
                          className={`px-2 py-1 text-sm block w-full ${
                            isNew || isChanged
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 font-medium'
                              : ''
                          }`}
                        >
                          {line || ' '}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Unified diff view */
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Unified View
              </h4>
              <div className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/10 min-h-[300px] font-mono">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {diff.map((line, index) => renderDiffLine(line, index, true))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}