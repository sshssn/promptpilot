'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import Image from 'next/image';

interface TestResult {
  modelId: string;
  modelName: string;
  provider: string;
  success: boolean;
  response?: string;
  error?: string;
  responseTime: number;
}

interface TestSummary {
  totalModels: number;
  successfulTests: number;
  failedTests: number;
  totalTime: number;
  results: TestResult[];
}

export function ModelTestInterface() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestSummary | null>(null);
  const { toast } = useToast();

  const runTests = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      const response = await fetch('/api/test-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to run tests');
      }

      const results = await response.json();
      setTestResults(results);
      
      toast({
        title: "Tests Complete",
        description: `${results.successfulTests}/${results.totalModels} models tested successfully`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Test error:', error);
      toast({
        variant: 'destructive',
        title: 'Test Failed',
        description: 'Failed to run model tests. Please try again.',
        duration: 3000,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return '/openai-color.svg';
      case 'deepseek': return '/deepseek-color.svg';
      case 'googleai': return '/gemini-color.svg';
      default: return '/openai-color.svg';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'bg-blue-100 text-blue-800';
      case 'deepseek': return 'bg-blue-100 text-blue-800';
      case 'googleai': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Play className="h-5 w-5" />
                Model Testing Interface
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Test all available AI models to verify API connectivity and functionality
              </p>
            </div>
            <Button
              onClick={runTests}
              disabled={isRunning}
              className="gap-2"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </div>
        </CardHeader>
        
        {testResults && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{testResults.totalModels}</div>
                <div className="text-sm text-muted-foreground">Total Models</div>
              </div>
              <div className="text-center p-4 bg-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-800">{testResults.successfulTests}</div>
                <div className="text-sm text-blue-600">Successful</div>
              </div>
              <div className="text-center p-4 bg-red-100 rounded-lg">
                <div className="text-2xl font-bold text-red-800">{testResults.failedTests}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
              <div className="text-center p-4 bg-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-800">{testResults.totalTime}ms</div>
                <div className="text-sm text-blue-600">Total Time</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testResults.results.map((result, index) => (
                <div
                  key={result.modelId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={getProviderIcon(result.provider)}
                      alt={result.provider}
                      width={20}
                      height={20}
                      className="flex-shrink-0"
                    />
                    <div>
                      <div className="font-medium text-sm">{result.modelName}</div>
                      <div className="text-xs text-muted-foreground">
                        {result.provider}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {result.responseTime}ms
                    </div>
                    
                    {result.success ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          Success
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <Badge variant="destructive" className="text-xs">
                          Failed
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {testResults.results.some(r => !r.success) && (
              <div className="mt-6">
                <h4 className="font-medium mb-3 text-red-800">Failed Tests Details:</h4>
                <div className="space-y-2">
                  {testResults.results
                    .filter(r => !r.success)
                    .map((result, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="font-medium text-red-800">{result.modelName}</div>
                        <div className="text-sm text-red-600">{result.error}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
