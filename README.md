# PromptPilot

PromptPilot is an AI-powered co-pilot designed to help developers and creators craft, refine, and manage high-quality prompts for generative AI models. It provides a streamlined interface for both generating new prompts from scratch and improving existing ones.

![PromptPilot Screenshot](https://raw.githubusercontent.com/sshssn/promptpilot/refs/heads/main/app-ui.png)
## Features

- **Generate New Prompts**: Create well-structured prompts by defining a role, context, sample inputs, and expected outputs.
- **Improve Existing Prompts**: Refine and optimize your current prompts by describing the issues and the desired changes.
- **Joblogic Integration**: Enhance prompts with contextual knowledge from the Joblogic knowledge base.
- **Light & Dark Mode**: A sleek, modern interface with support for both light and dark themes.
- **Copy to Clipboard**: Easily copy generated prompts to use in your projects.

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
