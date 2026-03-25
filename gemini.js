import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { getChatHistory, saveMessage } from './database.js';

dotenv.config();

const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = 'gemini-2.5-flash-lite';

export async function askGemini(jid, prompt, mimes = []) {
    try {
        // Retrieve history from database
        const history = await getChatHistory(jid, 10);

        // Prepare parts for the current message
        const currentParts = [{ text: prompt }];

        // Add images if any
        mimes.forEach(m => {
            currentParts.push({
                inlineData: {
                    mimeType: m.mimeType,
                    data: m.data // base64 string
                }
            });
        });

        const contents = [
            ...history,
            {
                role: 'user',
                parts: currentParts
            }
        ];

        const result = await client.models.generateContent({
            model: MODEL_NAME,
            contents,
            config: {
                systemInstruction: "You are 'Study-It', a helpful and encouraging educational WhatsApp bot. Your goal is to help students with their homework and questions. Explain concepts clearly and step-by-step. If an image is provided, analyze it carefully to solve the problem or explain the content.",
                maxOutputTokens: 2048,
            }
        });

        const responseText = result.text;

        // Save to database
        await saveMessage(jid, 'user', prompt);
        await saveMessage(jid, 'model', responseText);

        return responseText;
    } catch (error) {
        console.error('Error in askGemini:', error);

        if (error.message?.includes('429')) {
            console.error(`CRITICAL: Gemini Quota Exceeded for ${MODEL_NAME}. Switch models in gemini.js!`);
        }

        if (error.message?.includes('404') || error.message?.includes('not found')) {
            console.error(`CRITICAL: Model ${MODEL_NAME} not found. Check the model name in gemini.js!`);
        }

        return "I'm temporarily unavailable. Please try again in 1 minute! 🧠💤";
    }
}
