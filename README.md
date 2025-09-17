# PromptPilot

PromptPilot is an advanced AI-powered co-pilot designed to help developers and creators craft, refine, and manage high-quality prompts for generative AI models. It provides a comprehensive interface for generating new prompts, improving existing ones, and testing them in real-time.

![PromptPilot Screenshot](https://raw.githubusercontent.com/sshssn/promptpilot/refs/heads/main/app-ui.png)

## ✨ Features

### 🎯 **Core Prompt Management**
- **Generate New Prompts**: Create well-structured prompts by defining a role, context, sample inputs, and expected outputs
- **Improve Existing Prompts**: Refine and optimize your current prompts by describing the issues and desired changes
- **Rewrite Prompts**: Completely rewrite prompts with different styles, tones, or approaches
- **Evaluate Prompts**: Get detailed analysis and scoring of prompt quality and effectiveness
- **Compare Prompts**: Side-by-side analysis of original vs improved prompts with quality metrics

### 🧪 **Advanced Testing & Validation**
- **Interactive Playground**: Real-time testing environment with streaming AI responses
- **Stress Testing**: Comprehensive test suite with predefined test cases for different scenarios
- **Chat History**: Persistent conversation history with session management
- **Multimodal Support**: Upload and test with images, documents, and other media files

### 🏢 **Joblogic Integration**
- **Knowledge Enhancement**: Enhance prompts with contextual knowledge from the Joblogic knowledge base
- **Specialized Agents**: Pre-built prompt templates for different Joblogic chatbot types:
  - Classification Agent (condition-based routing)
  - General Assistant (comprehensive support)
  - Conversation Agent (greetings and flow management)
  - Complex Query Agent (advanced troubleshooting)
  - How-To Agent (step-by-step guidance)

### 🎨 **User Experience**
- **Modern UI**: Sleek, responsive design with ShadCN UI components
- **Light & Dark Mode**: Seamless theme switching with system preference detection
- **Copy to Clipboard**: One-click copying of generated prompts and responses
- **Keyboard Shortcuts**: Efficient navigation and operation shortcuts
- **Storage Management**: Local storage for prompts, conversations, and settings

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later)
- [npm](https://www.npmjs.com/) or another package manager like [Yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/sshssn/promptpilot.git
    cd promptpilot
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of your project and add your API keys:
    ```
    # DeepSeek API Configuration
    DEEPSEEK_API_KEY=your_deepseek_api_key_here
    OPENAI_API_KEY=your_deepseek_api_key_here
    OPENAI_BASE_URL=https://api.deepseek.com

    # Google AI Configuration (for Gemini)
    GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here
    ```

    **Note**: You can get your DeepSeek API key from [DeepSeek Platform](https://platform.deepseek.com/) and your Google AI API key from [Google AI Studio](https://aistudio.google.com/).

4.  **Run the development server:**
    ```sh
    npm run dev
    ```

The application will be available at `http://localhost:9002`.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
