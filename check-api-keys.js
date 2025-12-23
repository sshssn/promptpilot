#!/usr/bin/env node

/**
 * API Keys Checker
 * Checks if all required API keys are properly configured
 */

const fs = require('fs');
const path = require('path');

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found');
    console.log('📝 Please create a .env.local file with your API keys');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  const requiredKeys = [
    'OPENAI_API_KEY',
    'DEEPSEEK_API_KEY',
    'GOOGLE_AI_API_KEY'
  ];
  
  const missingKeys = [];
  const presentKeys = [];
  
  for (const key of requiredKeys) {
    const line = lines.find(l => l.startsWith(`${key}=`));
    if (line && line.split('=')[1] && line.split('=')[1].trim() !== '') {
      presentKeys.push(key);
    } else {
      missingKeys.push(key);
    }
  }
  
  console.log('🔑 API Keys Status:');
  console.log('='.repeat(30));
  
  for (const key of presentKeys) {
    console.log(`✅ ${key}: Configured`);
  }
  
  for (const key of missingKeys) {
    console.log(`❌ ${key}: Missing or empty`);
  }
  
  if (missingKeys.length > 0) {
    console.log('\n📝 To fix missing keys, add them to your .env.local file:');
    console.log('='.repeat(50));
    for (const key of missingKeys) {
      console.log(`${key}=your_api_key_here`);
    }
    console.log('\n🔗 Get your API keys from:');
    console.log('• OpenAI: https://platform.openai.com/api-keys');
    console.log('• DeepSeek: https://platform.deepseek.com/api_keys');
    console.log('• Google AI: https://aistudio.google.com/app/apikey');
    return false;
  }
  
  return true;
}

function main() {
  console.log('🔍 Checking API Keys Configuration...\n');
  
  const allKeysPresent = checkEnvFile();
  
  if (allKeysPresent) {
    console.log('\n✅ All API keys are configured!');
    console.log('🚀 You can now run the model tests:');
    console.log('   node test-models.js');
  } else {
    console.log('\n❌ Some API keys are missing or invalid');
    console.log('🔧 Please configure the missing keys and try again');
    process.exit(1);
  }
}

main();
