# Prompt Testing Playground

The Prompt Testing Playground is a modern LLM interface that allows users to test their generated prompts in real-time conversations. This feature enables users to validate prompt effectiveness before deploying them in production.

## Features

### 🎯 **Real-time Testing**
- Interactive chat interface with streaming responses
- Test prompts with various input scenarios
- See how the AI responds within the prompt's boundaries

### ⚙️ **Advanced Configuration**
- **Model Selection**: Choose from different Gemini models
- **Temperature Control**: Adjust creativity vs. consistency (0-2)
- **Token Limits**: Set maximum response length
- **Top-P & Top-K**: Fine-tune response diversity
- **Stop Sequences**: Define when the AI should stop generating

### 🔧 **System Prompt Management**
- Pre-populate system prompts from analysis results
- Edit and modify prompts on-the-fly
- Clear conversation history while preserving system prompt

### 📱 **Modern UI**
- Responsive design for desktop and mobile
- Dark/light theme support
- Real-time streaming with visual feedback
- Copy messages to clipboard
- Conversation timestamps

## Usage

### Launching the Playground

1. **From Analysis Results**: After comparing prompts, click "Launch Playground"
2. **From Main Navigation**: Use the "Playground" button in the header
3. **Direct URL**: Navigate to `/playground` with optional parameters:
   ```
   /playground?prompt=YOUR_PROMPT&model=gemini-2.5-flash&temperature=0.7
   ```

### Testing Workflow

1. **Set System Prompt**: Enter or modify the system prompt that defines AI behavior
2. **Configure Settings**: Adjust model parameters for your testing needs
3. **Start Conversation**: Send messages to test how the AI responds
4. **Iterate**: Modify settings or system prompt based on results
5. **Clear & Restart**: Reset conversation while keeping system prompt

### Best Practices

- **Test Edge Cases**: Try unusual or challenging inputs
- **Validate Boundaries**: Ensure the AI stays within prompt constraints
- **Multiple Scenarios**: Test different types of questions
- **Parameter Tuning**: Experiment with temperature and other settings
- **Document Results**: Note what works and what doesn't

## Technical Implementation

### API Endpoints
- `POST /api/playground/chat` - Streams AI responses

### Components
- `PlaygroundInterface` - Main chat interface
- `PlaygroundSettings` - Configuration panel
- `PlaygroundPage` - Main page layout

### Integration Points
- Launches from analysis results with pre-populated prompts
- Supports URL parameters for direct access
- Integrates with existing prompt generation workflows

## Configuration Options

| Setting | Range | Description |
|---------|-------|-------------|
| Temperature | 0-2 | Controls randomness (0=focused, 2=creative) |
| Max Tokens | 100-4000 | Maximum response length |
| Top-P | 0-1 | Nucleus sampling parameter |
| Top-K | 1-100 | Top-k sampling parameter |
| Stop Sequences | Text | Custom stop conditions |

## Quick Presets

- **Focused & Precise**: Low temperature, conservative settings
- **Balanced**: Moderate settings for general use
- **Creative & Diverse**: High temperature, diverse responses

This playground provides a comprehensive testing environment for validating prompt effectiveness before deployment.
