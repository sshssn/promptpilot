# PromptPilot

PromptPilot is a comprehensive AI prompt engineering platform designed for developers and AI product teams. It provides advanced tools for creating, testing, evaluating, and optimizing prompts across multiple AI models with specialized focus on Joblogic chatbot integration.

## Overview

PromptPilot transforms prompt engineering from a manual process into a systematic, AI-assisted workflow. The platform combines intelligent prompt generation, real-time testing, comprehensive evaluation, and specialized Joblogic integration to deliver production-ready AI prompts.

## Key Features

### Prompt Management
- **Generate**: Create new prompts from user requirements with AI assistance
- **Improve**: Enhance existing prompts with optimization suggestions
- **Rewrite**: Transform prompts with different styles and approaches
- **Evaluate**: Comprehensive quality analysis with 1-10 scoring system
- **Compare**: Side-by-side analysis with improvement metrics

### Testing & Validation
- **Interactive Playground**: Real-time testing with streaming AI responses
- **Stress Testing**: 25+ test scenarios across 5 categories
- **Model Comparison**: Side-by-side testing across multiple AI models
- **Multimodal Support**: Upload and test with images, documents, and media files
- **Chat History**: Persistent conversation storage with session management

### Joblogic Integration
- **Knowledge Enhancement**: Contextual knowledge from Joblogic documentation
- **Specialized Agents**: Pre-built templates for different chatbot types
- **Smart Routing**: Automatic enhancement based on prompt analysis
- **System Instruction Management**: Golden standard vs custom prompt routing

### AI Model Support
- **OpenAI**: GPT-4.1, GPT-4.1 Mini, GPT-4.1 Nano, GPT-5, GPT-5 Mini, GPT-5 Nano
- **DeepSeek**: V3.1 (Standard & Thinking Mode)
- **Google AI**: Gemini 2.5 Flash, Gemini 2.0 Flash (Experimental)

## Technical Architecture

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: ShadCN UI components
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Icons**: Lucide React

### Backend
- **AI Integration**: Google Genkit
- **API Routes**: Next.js API routes with streaming support
- **Model Providers**: OpenAI, DeepSeek, Google AI
- **File Processing**: Multimodal file handling

### Key Components
- **PromptPilot**: Main interface with tabbed navigation
- **Playground Interface**: Real-time testing environment
- **Stress Test Interface**: Comprehensive testing suite
- **Model Test Interface**: Model performance testing
- **Storage Manager**: Local data management
- **System Instruction Router**: Smart prompt enhancement

## Installation

### Prerequisites
- Node.js 20 or later
- npm, yarn, or pnpm

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sshssn/promptpilot.git
   cd promptpilot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # DeepSeek Configuration
   DEEPSEEK_API_KEY=your_deepseek_api_key_here

   # Google AI Configuration
   GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:9002`.

## Usage

### Basic Workflow
1. **Generate**: Create a new prompt using the Generate tab
2. **Test**: Use the Playground to test your prompt with live AI responses
3. **Evaluate**: Run stress tests to validate prompt robustness
4. **Compare**: Test across multiple models to find the best fit
5. **Optimize**: Use evaluation tools to improve prompt quality

### Advanced Features
- **Stress Testing**: Validate prompts against 25+ test scenarios
- **Model Comparison**: Test across GPT-5, DeepSeek, and Gemini models
- **Joblogic Integration**: Apply specialized agent templates
- **Smart Enhancement**: Automatic prompt optimization

## API Endpoints

### Core Chat APIs
- `/api/chat` - Main chat routing
- `/api/chat/openai` - OpenAI integration
- `/api/chat/deepseek` - DeepSeek integration
- `/api/playground/chat` - Playground chat with Gemini

### Enhancement APIs
- `/api/system-instruction-router` - Smart prompt routing
- `/api/generate-title` - Automatic title generation

### Testing APIs
- `/api/test-models` - Model performance testing
- `/api/feedback` - User feedback collection

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run test:models` - Test model configurations

### Project Structure
```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── playground/     # Playground pages
│   └── layout.tsx      # Root layout
├── components/         # React components
├── contexts/          # React contexts
├── hooks/             # Custom hooks
├── lib/               # Utility libraries
├── services/          # Business logic
└── ai/               # AI flows and configurations
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.
