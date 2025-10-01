import { modelPromptMatcher } from './model-prompt-matcher';

// Test function to verify model matching works
export async function testModelMatching() {
  console.log('🧪 Testing Model Matching System...\n');
  
  const testModels = [
    'gpt-4.1',
    'gpt-5', 
    'googleai/gemini-2.5-flash',
    'deepseek-v3.1'
  ];
  
  for (const modelId of testModels) {
    try {
      console.log(`\n📋 Testing Model: ${modelId}`);
      const match = await modelPromptMatcher.getModelPromptMatch(modelId);
      
      console.log(`✅ Model: ${match.modelName}`);
      console.log(`🎯 Provider: ${match.provider}`);
      console.log(`🎯 Confidence: ${Math.round(match.confidence * 100)}%`);
      console.log(`🎯 Reasoning: ${match.reasoning}`);
      
      if (match.exactMatch) {
        console.log(`🎯 Exact Match: ${match.exactMatch.name} (${match.exactMatch.provider})`);
        console.log(`🎯 Date: ${match.exactMatch.date}`);
      } else {
        console.log(`🎯 Fallback Matches: ${match.fallbackMatches.length}`);
        if (match.fallbackMatches.length > 0) {
          console.log(`🎯 Best Fallback: ${match.fallbackMatches[0].name} (${match.fallbackMatches[0].provider})`);
        }
      }
      
      // Test model-specific guidance
      const guidance = await modelPromptMatcher.getModelSpecificGuidance(modelId, 'test prompt');
      console.log(`🎯 Guidance Length: ${guidance.length} characters`);
      
    } catch (error) {
      console.error(`❌ Error testing ${modelId}:`, error);
    }
  }
  
  console.log('\n✅ Model Matching Test Complete!');
}

// Run test if this file is executed directly
if (require.main === module) {
  testModelMatching().catch(console.error);
}


