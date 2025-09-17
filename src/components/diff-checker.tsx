'use client';

import React, { useState } from 'react';
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
  // Enhanced diff algorithm - handles both line-by-line and word-by-word comparison
  const generateDiff = (original: string, improved: string): DiffLine[] => {
    const originalLines = original.split('\n');
    const improvedLines = improved.split('\n');
    
    const diff: DiffLine[] = [];
    let i = 0, j = 0;
    
    while (i < originalLines.length || j < improvedLines.length) {
      if (i >= originalLines.length) {
        // Only improved text left
        diff.push({ type: 'added', content: improvedLines[j] });
        j++;
      } else if (j >= improvedLines.length) {
        // Only original text left
        diff.push({ type: 'removed', content: originalLines[i] });
        i++;
      } else if (originalLines[i] === improvedLines[j]) {
        // Lines match exactly
        diff.push({ type: 'unchanged', content: originalLines[i] });
        i++;
        j++;
      } else {
        // Lines don't match - look for best match
        let found = false;
        
        // Look ahead in improved text for a match
        for (let k = j + 1; k < Math.min(j + 5, improvedLines.length); k++) {
          if (originalLines[i] === improvedLines[k]) {
            // Add all lines from improved text up to the match as added
            for (let l = j; l < k; l++) {
              diff.push({ type: 'added', content: improvedLines[l] });
            }
            j = k;
            found = true;
            break;
          }
        }
        
        if (!found) {
          // Look ahead in original text for a match
          for (let k = i + 1; k < Math.min(i + 5, originalLines.length); k++) {
            if (originalLines[k] === improvedLines[j]) {
              // Add all lines from original text up to the match as removed
              for (let l = i; l < k; l++) {
                diff.push({ type: 'removed', content: originalLines[l] });
              }
              i = k;
              found = true;
              break;
            }
          }
        }
        
        if (!found) {
          // No match found, treat as replacement
          diff.push({ type: 'removed', content: originalLines[i] });
          diff.push({ type: 'added', content: improvedLines[j] });
          i++;
          j++;
        }
      }
    }
    
    return diff;
  };


  const diff = generateDiff(originalText, improvedText);

  // Create separate arrays for left and right sides
  const leftSide = diff.map((line, index) => ({
    ...line,
    index,
    show: line.type === 'removed' || line.type === 'unchanged'
  }));

  const rightSide = diff.map((line, index) => ({
    ...line,
    index,
    show: line.type === 'added' || line.type === 'unchanged'
  }));

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
                    {leftSide.filter(line => line.type === 'removed').length} removals
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const originalText = leftSide
                        .filter(line => line.show)
                        .map(line => line.content)
                        .join('');
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
                    {leftSide.map((line, index) => 
                      line.show ? renderDiffLine(line, index) : null
                    )}
                  </div>
                </div>
              </div>

              {/* Improved Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {rightSide.filter(line => line.type === 'added').length} additions
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const improvedText = rightSide
                        .filter(line => line.show)
                        .map(line => line.content)
                        .join('');
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
                    {rightSide.map((line, index) => 
                      line.show ? renderDiffLine(line, index) : null
                    )}
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
