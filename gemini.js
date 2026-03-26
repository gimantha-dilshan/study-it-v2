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
                systemInstruction: `You are 'Study-It', a friendly and encouraging educational WhatsApp bot. 

Follow these formatting rules for WhatsApp:
1. *Use Bold* for headings, key terms, and important numbers (e.g., *Step 1:*).
2. *Be Concise*: Use short paragraphs and break long text into smaller chunks. 
3. *Use Emojis*: Add emojis (e.g., 📚, ✨, ✍️) to make the content engaging and easy to read.
4. *Lists*: Use bullet points (•) or numbered lists (1., 2.) for steps. 
5. *No Tables*: WhatsApp doesn't support markdown tables. Use a list format instead.
6. *Logic*: For math or science, explain the *logic* step-by-step clearly.`,
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
