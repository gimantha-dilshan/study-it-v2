import { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    downloadContentFromMessage,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import fs from 'fs';
import readline from 'readline';
import { askGemini } from './gemini.js';
import { 
    initDB, 
    isUserSeen, 
    markUserAsSeen, 
    getAdminStats,
    getAllUsers
} from './database.js';

const ADMIN_NUMBER = process.env.ADMIN_NUMBER;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const WELCOME_MESSAGE = `Welcome to *Study It! 🎓✨*

Your 24/7 AI Study Partner is now online. I’m here to help you solve problems, explain tricky concepts, and get your homework done faster!

Here’s what I can do for you:
📸 *Scan Homework:* Just send a photo of any problem (math, science, etc.).
💬 *Ask Anything:* Type any question you're stuck on.
🧠 *Step-by-Step:* I don't just give answers, I explain how to solve them.

Ready to start? Just send me a message or a photo of your assignment! 🚀`;

async function connectToWhatsApp() {
    await initDB(); // Initialize the database
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Using WA version: ${version.join('.')}, isLatest: ${isLatest}`);

    const socket = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        printQRInTerminal: false,
    });

    if (!socket.authState.creds.registered) {
        const phoneNumber = await question('Enter your WhatsApp number (with country code, e.g., 94771234567): ');
        
        // Give the socket some time to initialize before requesting the code
        console.log('Waiting for socket to be ready for pairing code...');
        setTimeout(async () => {
            try {
                const code = await socket.requestPairingCode(phoneNumber);
                console.log(`\nYour Pair Code: ${code}\n`);
            } catch (err) {
                console.error('Failed to request pairing code:', err);
                console.log('Tip: If you see "Connection Closed", try running the bot again and double check your number.');
            }
        }, 6000); // Increased delay
    }

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const statusCode = (lastDisconnect.error?.output?.statusCode || lastDisconnect.error?.code);
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            console.log(`Connection closed. Status code: ${statusCode}. Reconnecting: ${shouldReconnect}`);
            
            if (shouldReconnect) {
                // Add a small delay before reconnecting to avoid spamming
                setTimeout(() => connectToWhatsApp(), 5000);
            } else {
                console.log('Logged out. Please delete the auth_info_baileys folder and scan the QR code again.');
            }
        } else if (connection === 'open') {
            console.log('Successfully connected to WhatsApp!');
        }
    });

    socket.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const remoteJid = msg.key.remoteJid;
        const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const imageMessage = msg.message.imageMessage;

        // Send welcome message if it's the first time seeing this user
        if (!(await isUserSeen(remoteJid))) {
            await socket.sendMessage(remoteJid, { text: WELCOME_MESSAGE });
            await markUserAsSeen(remoteJid);
            return; // Only send welcome message on first interaction, don't trigger AI yet
        }

        try {
            if (imageMessage) {
                console.log(`Received image from ${remoteJid}`);
                const stream = await downloadContentFromMessage(imageMessage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                const base64Image = buffer.toString('base64');
                const caption = imageMessage.caption || "Analyze this homework image.";
                
                await socket.sendMessage(remoteJid, { text: "Thinking about your image... 🧐" }, { quoted: msg });
                const aiResponse = await askGemini(remoteJid, caption, [{ mimeType: 'image/jpeg', data: base64Image }]);
                await socket.sendMessage(remoteJid, { text: aiResponse }, { quoted: msg });

            } else if (textMessage) {
                // COMMAND HANDLING (Admin Only)
                const isAdmin = remoteJid === ADMIN_NUMBER;

                if (isAdmin) {
                    if (textMessage.toLowerCase() === '.stats') {
                        const stats = await getAdminStats();
                        await socket.sendMessage(remoteJid, { text: `📊 *Study-It Stats*\n\n👥 Total Users: ${stats.users}\n💬 Total Messages: ${stats.messages}` }, { quoted: msg });
                        return;
                    }

                    if (textMessage.toLowerCase().startsWith('.broadcast ')) {
                        const broadcastMsg = textMessage.replace('.broadcast ', '').trim();
                        const users = await getAllUsers();
                        let successCount = 0;

                        for (const user of users) {
                            try {
                                await socket.sendMessage(user, { text: `📢 *Global Message from Study-It*\n\n${broadcastMsg}` });
                                successCount++;
                            } catch (err) {
                                console.error(`Failed to broadcast to ${user}:`, err);
                            }
                        }

                        await socket.sendMessage(remoteJid, { text: `✅ Broadcast sent to ${successCount} users.` }, { quoted: msg });
                        return;
                    }
                } else if (textMessage.startsWith('.')) {
                    // For non-admin users, ignore any message starting with .
                    // This prevents them from accidentally triggering AI with command-like text.
                    return;
                }

                console.log(`Received message from ${remoteJid}: ${textMessage}`);
                await socket.readMessages([msg.key]);
                
                // Show a simple "Typing" status
                await socket.sendPresenceUpdate('composing', remoteJid);
                
                const aiResponse = await askGemini(remoteJid, textMessage);
                
                await socket.sendPresenceUpdate('paused', remoteJid);
                await socket.sendMessage(remoteJid, { text: aiResponse }, { quoted: msg });
            }
        } catch (error) {
            console.error('Error processing message:', error);
            await socket.sendMessage(remoteJid, { text: "Ouch! Something went wrong while processing your request. Please try again later." }, { quoted: msg });
        }
    });
}

connectToWhatsApp();
