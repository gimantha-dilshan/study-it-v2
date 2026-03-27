import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { getChatHistory, saveMessage } from './database.js';

dotenv.config();

const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const PRIMARY_MODEL = 'gemini-2.5-flash';
const SECONDARY_MODEL = 'gemini-2.5-flash-lite';

export async function askGemini(jid, prompt, mimes = [], modelChoice = PRIMARY_MODEL) {
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

        console.log(`Asking Gemini (${modelChoice})...`);
        const result = await client.models.generateContent({
            model: modelChoice,
            contents: contents,
            config: {
                systemInstruction: `You are 'Study-It', a friendly, encouraging, and highly intelligent educational WhatsApp bot. 

CRITICAL INSTRUCTION: You are communicating directly on WhatsApp. You MUST use WhatsApp's specific text formatting rules. NEVER use standard Markdown (do not use **, #, or ##).

Follow these formatting rules strictly for every response:
1. BOLD: Use a single asterisk on both sides of the text (e.g., *Heading* or *Important Term*). NEVER use double asterisks.
2. ITALICS: Use an underscore on both sides (e.g., _concept_).
3. HEADINGS: Do not use # or ##. To create a heading, use bold text combined with an emoji (e.g., *📚 Step 1:*).
4. LISTS: Use a hyphen and a space (- item) for bullet points. Use numbers (1. item) for ordered lists. 
5. MATH & CODE: Use single backticks (\`x = 5\`) for inline math or code. Use triple backticks (\`\`\`code\`\`\`) for multi-line code or complex formulas.
6. NO TABLES: WhatsApp does not support tables. Always convert tabular data into a clean, bulleted list.
7. READABILITY: Keep paragraphs very short (1-2 sentences max). Always leave a blank line between paragraphs so it is easy to read on a mobile screen.
8. TONE & EMOJIS: Be encouraging. Use emojis naturally (💡, ✍️, ✨, 🚀) to make the text engaging. For math or science, always explain the logic step-by-step.`,
            }
        });

        const responseText = result.text;

        // Save to database
        await saveMessage(jid, 'user', prompt);
        await saveMessage(jid, 'model', responseText);

        return responseText;
    } catch (error) {
        console.error(`Error with ${modelChoice}:`, error.message);

        // FALLBACK LOGIC: If the primary fails, try the secondary
        if (modelChoice === PRIMARY_MODEL) {
            console.log(`⚠️ Falling back to ${SECONDARY_MODEL}...`);
            return await askGemini(jid, prompt, mimes, SECONDARY_MODEL);
        }

        // If even the secondary fails, throw the error
        if (error.message?.includes('429')) {
            console.error(`CRITICAL: Gemini Quota Exceeded for ${modelChoice}.`);
        }

        throw error; // Let index.js handle the user-facing error message
    }
}