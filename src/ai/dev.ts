import { config } from 'dotenv';
config();

import '@/ai/flows/enhance-prompt-with-joblogic-knowledge.ts';
import '@/ai/flows/improve-existing-prompt.ts';
import '@/ai/flows/generate-prompt-from-details.ts';
import '@/ai/flows/identify-missing-prompt-details.ts';