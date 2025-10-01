import { NextRequest, NextResponse } from 'next/server';
import { ALL_MODELS } from '@/lib/models';

interface TestResult {
  modelId: string;
  modelName: string;
  provider: string;
  success: boolean;
  response?: string;
  error?: string;
  responseTime: number;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const results: TestResult[] = [];
  
  console.log('Starting model tests...');
  
  for (const model of ALL_MODELS) {
    const testStartTime = Date.now();
    console.log(`Testing model: ${model.name} (${model.id})`);
    
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:9002'}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: 'Hello! Please respond with "Test successful" and your model name.'
            }
          ],
          config: {
            model: model.id,
            temperature: 1.0, // Use default temperature for all models
            maxTokens: 50
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let content = '';
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                done = true;
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  content += parsed.content;
                } else if (parsed.error) {
                  // Handle error responses
                  throw new Error(parsed.details || parsed.error);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
      
      const testEndTime = Date.now();
      const responseTime = testEndTime - testStartTime;
      
      results.push({
        modelId: model.id,
        modelName: model.name,
        provider: model.provider,
        success: true,
        response: content,
        responseTime
      });
      
      console.log(`✅ ${model.name}: Success (${responseTime}ms)`);
      
    } catch (error) {
      const testEndTime = Date.now();
      const responseTime = testEndTime - testStartTime;
      
      results.push({
        modelId: model.id,
        modelName: model.name,
        provider: model.provider,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      });
      
      console.log(`❌ ${model.name}: Failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Add small delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const totalTime = Date.now() - startTime;
  
  const summary = {
    totalModels: ALL_MODELS.length,
    successfulTests: results.filter(r => r.success).length,
    failedTests: results.filter(r => !r.success).length,
    totalTime,
    results
  };
  
  console.log(`\nTest Summary:`);
  console.log(`Total Models: ${summary.totalModels}`);
  console.log(`Successful: ${summary.successfulTests}`);
  console.log(`Failed: ${summary.failedTests}`);
  console.log(`Total Time: ${totalTime}ms`);
  
  return NextResponse.json(summary);
}
