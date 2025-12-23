/**
 * Model configurations for testing
 * Simplified version of the main models.ts for Node.js compatibility
 */

const models = [
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    temperatureRestrictions: {
      default: 1.0,
      supportedValues: [1.0]
    }
  },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'openai',
    temperatureRestrictions: {
      default: 1.0,
      supportedValues: [1.0]
    }
  },
  {
    id: 'gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'openai',
    temperatureRestrictions: {
      default: 1.0,
      supportedValues: [1.0]
    }
  },
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    temperatureRestrictions: {
      default: 1.0,
      supportedValues: [1.0]
    }
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'openai',
    temperatureRestrictions: {
      default: 1.0,
      supportedValues: [1.0]
    }
  },
  {
    id: 'gpt-5-nano',
    name: 'GPT-5 Nano',
    provider: 'openai',
    temperatureRestrictions: {
      default: 1.0,
      supportedValues: [1.0]
    }
  },
  {
    id: 'deepseek-v3.1',
    name: 'DeepSeek-V3.1 (Non-thinking Model)',
    provider: 'deepseek'
  },
  {
    id: 'deepseek-v3.1-thinking',
    name: 'DeepSeek-V3.1 (Thinking Mode)',
    provider: 'deepseek'
  },
  {
    id: 'googleai/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'googleai'
  },
  {
    id: 'googleai/gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Experimental)',
    provider: 'googleai'
  }
];

module.exports = { models };
