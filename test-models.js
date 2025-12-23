#!/usr/bin/env node

/**
 * Model Testing Script
 * Tests all available AI models to verify API connectivity
 */

// Import model configurations
const { models } = require('./test-models-config.js');

async function testModel(model) {
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:9002/api/chat', {
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
          temperature: model.temperatureRestrictions?.default || 1.0, // Use model's default temperature
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

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      model: model.name,
      provider: model.provider,
      success: true,
      response: content,
      responseTime,
      error: null
    };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      model: model.name,
      provider: model.provider,
      success: false,
      response: null,
      responseTime,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('🚀 Starting Model Tests...\n');
  console.log(`Testing ${models.length} models...\n`);

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const model of models) {
    console.log(`Testing ${model.name} (${model.provider})...`);
    
    const result = await testModel(model);
    results.push(result);

    if (result.success) {
      console.log(`✅ ${model.name}: Success (${result.responseTime}ms)`);
      console.log(`   Response: ${result.response?.substring(0, 100)}...`);
      successCount++;
    } else {
      console.log(`❌ ${model.name}: Failed - ${result.error}`);
      failCount++;
    }
    
    console.log(''); // Empty line for readability
    
    // Add small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Models: ${models.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`Success Rate: ${((successCount / models.length) * 100).toFixed(1)}%`);
  console.log('');

  // Failed tests details
  if (failCount > 0) {
    console.log('❌ FAILED TESTS:');
    console.log('-'.repeat(30));
    results
      .filter(r => !r.success)
      .forEach(result => {
        console.log(`${result.model} (${result.provider}): ${result.error}`);
      });
    console.log('');
  }

  // Successful tests
  if (successCount > 0) {
    console.log('✅ SUCCESSFUL TESTS:');
    console.log('-'.repeat(30));
    results
      .filter(r => r.success)
      .forEach(result => {
        console.log(`${result.model} (${result.provider}): ${result.responseTime}ms`);
      });
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:9002/api/test-models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking if server is running...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:9002');
    console.log('Please start the development server first:');
    console.log('  npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  await runTests();
}

main().catch(console.error);
