import { routeSystemInstruction } from './system-instruction-router';

// Test cases for the system instruction router
describe('System Instruction Router', () => {
  test('should use user instruction when provided', async () => {
    const result = await routeSystemInstruction({
      userSystemInstruction: 'You are a helpful customer service agent. Always be polite and professional.',
      userPrompt: 'How do I reset my password?',
      context: 'customer_support'
    });

    expect(result.shouldUseLangMd).toBe(false);
    expect(result.appliedSource).toBe('user_instruction');
    expect(result.finalSystemInstruction).toContain('customer service agent');
  });

  test('should use lang.md when no user instruction provided', async () => {
    const result = await routeSystemInstruction({
      userSystemInstruction: '',
      userPrompt: 'How do I log a job?',
      context: 'playground'
    });

    expect(result.shouldUseLangMd).toBe(true);
    expect(result.appliedSource).toBe('lang_md_default');
    expect(result.finalSystemInstruction).toContain('Joblogic');
  });

  test('should use lang.md when user instruction is placeholder text', async () => {
    const result = await routeSystemInstruction({
      userSystemInstruction: 'You are a helpful assistant.',
      userPrompt: 'What can you help me with?',
      context: 'playground'
    });

    expect(result.shouldUseLangMd).toBe(true);
    expect(result.appliedSource).toBe('lang_md_default');
  });

  test('should use lang.md when user instruction is too short', async () => {
    const result = await routeSystemInstruction({
      userSystemInstruction: 'Help me',
      userPrompt: 'I need assistance',
      context: 'playground'
    });

    expect(result.shouldUseLangMd).toBe(true);
    expect(result.appliedSource).toBe('lang_md_default');
  });

  test('should use user instruction when it contains meaningful content', async () => {
    const result = await routeSystemInstruction({
      userSystemInstruction: 'You are a technical support specialist for Joblogic. You should provide step-by-step troubleshooting guidance and escalate complex issues to human agents when necessary.',
      userPrompt: 'My app is crashing',
      context: 'technical_support'
    });

    expect(result.shouldUseLangMd).toBe(false);
    expect(result.appliedSource).toBe('user_instruction');
    expect(result.finalSystemInstruction).toContain('technical support specialist');
  });
});

// Example usage scenarios
export const testScenarios = [
  {
    name: 'Empty System Instruction',
    input: {
      userSystemInstruction: '',
      userPrompt: 'How do I create a new job?',
      context: 'playground'
    },
    expectedSource: 'lang_md_default',
    description: 'Should use Joblogic standards when no instruction provided'
  },
  {
    name: 'Placeholder System Instruction',
    input: {
      userSystemInstruction: 'You are a helpful AI assistant.',
      userPrompt: 'Can you help me?',
      context: 'playground'
    },
    expectedSource: 'lang_md_default',
    description: 'Should use Joblogic standards for generic placeholder text'
  },
  {
    name: 'Custom System Instruction',
    input: {
      userSystemInstruction: 'You are a specialized Joblogic trainer. Focus on providing educational content and best practices for field service management.',
      userPrompt: 'How should I train new engineers?',
      context: 'training'
    },
    expectedSource: 'user_instruction',
    description: 'Should use custom instruction when meaningful content provided'
  },
  {
    name: 'Joblogic-Specific Custom Instruction',
    input: {
      userSystemInstruction: 'You are a Joblogic support agent. Always check for sensitive information and escalate when needed. Use the #Sensitive tag for personal data.',
      userPrompt: 'My customer John Smith needs help with invoice INV123',
      context: 'support'
    },
    expectedSource: 'user_instruction',
    description: 'Should use custom instruction even when Joblogic-related'
  }
];

