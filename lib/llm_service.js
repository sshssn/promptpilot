export class LLMService {
    constructor() {
        this.geminiBaseUrl = "https://generativelanguage.googleapis.com/v1beta/models/";
        this.openAiApiUrl = "https://api.openai.com/v1/chat/completions";
    }

    async solve(imageBase64, provider, apiKey) {
        if (!apiKey) {
            throw new Error("API Key is missing. Please set it in Options.");
        }

        // Provider is now the full model string for Gemini like 'gemini-2.0-flash' or 'gemini-1.5-pro'
        // Or 'gpt-4o' for OpenAI

        if (provider.startsWith('gemini')) {
            // Handle legacy "gemini" by upgrading to 2.5-flash
            const model = (provider === 'gemini') ? 'gemini-2.5-flash' : provider;
            return this.solveWithGemini(imageBase64, apiKey, model);
        } else if (provider.startsWith('gpt')) {
            // Handle any gpt string derived from provider
            return this.solveWithOpenAI(imageBase64, apiKey, provider);
        } else {
            // Legacy fallbacks
            if (provider === 'openai') return this.solveWithOpenAI(imageBase64, apiKey, 'gpt-4o-mini');

            // Default safety
            console.warn(`Unknown provider '${provider}', defaulting to Gemini 2.5 Flash`);
            return this.solveWithGemini(imageBase64, apiKey, 'gemini-2.5-flash');
        }
    }

    async solveWithGemini(imageBase64, apiKey, modelName) {
        // Current base64 often comes with a header "data:image/png;base64,", strip it
        const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

        // Construct URL: https://generativelanguage.googleapis.com/v1beta/models/[MODEL_NAME]:generateContent
        const model = modelName || 'gemini-2.0-flash';
        const url = `${this.geminiBaseUrl}${model}:generateContent`;

        const payload = {
            contents: [{
                parts: [
                    { text: "Solve the question in this image. Provide the answer directly and concisely." },
                    {
                        inline_data: {
                            mime_type: "image/png",
                            data: cleanBase64
                        }
                    }
                ]
            }]
        };

        const response = await fetch(`${url}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`Gemini Error: ${err.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!answer) throw new Error("No answer received from Gemini.");
        return answer;
    }

    async solveWithOpenAI(imageBase64, apiKey, modelName) {
        const model = modelName || 'gpt-4o-mini';
        const payload = {
            model: model,
            messages: [
                {
                    role: "system",
                    content: "You are an expert problem solver. Your goal is to provide the correct answer with high precision. First, think through the problem step-by-step to verify your logic. Then, provide the final answer clearly and concisely."
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Solve the question in this image. Provide the answer directly." },
                        { type: "image_url", image_url: { url: imageBase64 } }
                    ]
                }
            ],
            max_tokens: 300
        };

        const response = await fetch(this.openAiApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`OpenAI Error: ${err.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }
}
