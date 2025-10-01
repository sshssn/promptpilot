# System Instruction Routing System

## Overview

The System Instruction Routing System is a core feature of PromptPilot that intelligently determines whether to use user-provided system instructions or fall back to the default Joblogic standards (lang.md) when processing prompts.

## How It Works

### Decision Logic

The system uses a two-tier approach:

1. **Quick Heuristic Check**: Fast detection of meaningful vs placeholder content
2. **AI-Powered Analysis**: For edge cases, uses AI to make nuanced decisions

### Routing Rules

| Scenario | User Instruction | Result | Reasoning |
|----------|------------------|--------|-----------|
| **Empty/No Instruction** | `""` or `undefined` | Use lang.md | No custom instruction provided |
| **Placeholder Text** | `"You are a helpful assistant"` | Use lang.md | Generic placeholder detected |
| **Short Content** | `"Help me"` (< 50 chars) | Use lang.md | Insufficient meaningful content |
| **Meaningful Content** | `"You are a specialized Joblogic trainer..."` | Use user instruction | Specific, actionable instruction |

### Implementation

#### Core Router Function

```typescript
await routeSystemInstruction({
  userSystemInstruction: string,  // User's custom instruction
  userPrompt: string,            // The prompt being processed
  context: string                // Context (playground, support, etc.)
});
```

#### Response Structure

```typescript
{
  shouldUseLangMd: boolean,           // true = use lang.md, false = use user instruction
  finalSystemInstruction: string,     // The actual instruction to use
  reasoning: string,                  // Why this decision was made
  appliedSource: 'user_instruction' | 'lang_md_default'
}
```

## Integration Points

### 1. Playground Interface

- **Location**: `/playground`
- **Behavior**: Shows system instruction indicator
- **User Experience**: Clear indication of which instruction is being used

### 2. Prompt Enhancement Flows

- **Improve Existing Prompt**: Respects user system instructions
- **Agent-Aware Enhancement**: Uses routing for agent selection
- **Smart Router**: Integrates with existing enhancement pipeline

### 3. API Endpoints

- **Playground Chat API**: Routes system instructions for chat
- **Prompt Enhancement APIs**: All enhancement flows use routing

## User Experience

### Visual Indicators

The system provides clear visual feedback:

- **Blue Badge**: "Custom Instruction" - User's instruction is being used
- **Gray Badge**: "Joblogic Standards" - Default lang.md is being used
- **Details Panel**: Shows reasoning and tips

### Settings Integration

Users can:
- Provide custom system instructions in playground settings
- Override Joblogic standards when needed
- See real-time feedback on which instruction is active

## Examples

### Scenario 1: Default Behavior
```typescript
// User provides no system instruction
userSystemInstruction: ""
// Result: Uses lang.md with full Joblogic standards
```

### Scenario 2: Custom Override
```typescript
// User provides specific instruction
userSystemInstruction: "You are a customer service agent. Always be empathetic and solution-focused."
// Result: Uses user instruction, overrides Joblogic standards
```

### Scenario 3: Placeholder Detection
```typescript
// User provides generic placeholder
userSystemInstruction: "You are a helpful AI assistant."
// Result: Uses lang.md (placeholder detected)
```

## Benefits

1. **Flexibility**: Users can override standards when needed
2. **Consistency**: Default behavior ensures Joblogic compliance
3. **Transparency**: Clear indication of which instruction is active
4. **Intelligence**: Smart detection of meaningful vs placeholder content

## Technical Details

### Heuristic Detection

The system detects placeholder content using patterns:
- Generic phrases: "You are a helpful assistant"
- Short content: Less than 50 characters
- Common placeholders: "Enter detailed instructions"

### AI Analysis

For edge cases, the system uses AI to:
- Analyze instruction meaningfulness
- Determine specificity and actionability
- Make nuanced routing decisions

### Performance

- **Fast Path**: Heuristic checks are instant
- **AI Path**: Only used for ambiguous cases
- **Caching**: Results can be cached for repeated requests

## Configuration

### Default Joblogic Instruction

The system includes the complete Joblogic instruction set from `lang.md`:
- Classification rules (How-To, Complex, Issue, Request, Conversation)
- Tag-based logic (#Sensitive, #Escalate, #Probing, etc.)
- Response formatting requirements
- Escalation criteria

### Customization

Users can:
- Override any part of the Joblogic standards
- Add custom instructions for specific use cases
- Maintain compliance while adding flexibility

## Troubleshooting

### Common Issues

1. **Instruction Not Applied**: Check if content is meaningful and specific
2. **Unexpected Routing**: Review the reasoning provided in the details panel
3. **Performance Issues**: Ensure proper caching of routing decisions

### Debug Information

The system provides detailed reasoning for all routing decisions:
- Why a particular source was chosen
- What factors influenced the decision
- Tips for achieving desired behavior

## Future Enhancements

- **Learning Mode**: System learns from user preferences
- **Template Library**: Pre-built instruction templates
- **A/B Testing**: Compare different instruction approaches
- **Analytics**: Track instruction effectiveness

