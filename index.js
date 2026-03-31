import dotenv from 'dotenv';
dotenv.config();

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
    saveMessage,
    isUserSeen,
    markUserAsSeen,
    getUserProfile,
    incrementUsage,
    getAdminStats,
    getAllUsers,
    supabase
} from './database.js';

const ADMIN_NUMBER = process.env.ADMIN_NUMBER;

// --- Terminal Colors ---
const C = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    magenta: "\x1b[35m"
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const WELCOME_MESSAGE = `Welcome to *Study-It 🎓✨*

I am your 24/7 AI-powered Study Partner, designed to help you excel. I now support full *Multimedia Learning!* 🚀

📸 *Scan Homework:* Send any photo of a problem for a step-by-step solution.
👂 *Voice Support:* Send a voice note, and I'll listen and explain concepts to you.
📄 *Read Documents:* Upload a PDF or Textbook page for instant analysis.
🧠 *Deep AI:* I use Gemini 2.5 Flash for the most accurate educational help.

*Quick Tip:* Register once on our website to increase your daily limit from 5 to *100* messages!

Ready to begin? Just ask me a question or send a photo of your task! 📚✍️💡`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Deduplication: Prevent double-processing when both Realtime and polling detect the same item
const processingBroadcasts = new Set();
const processingRegistrations = new Set();
const POLL_INTERVAL = 30000; // 30 seconds

// --- Professional Console Branding ---
function printHeader() {
    console.clear();
    console.log(`${C.cyan}${C.bold}=================================================`);
    console.log(`       STUDY-IT V2.5 - AI STUDY PARTNER`);
    console.log(`       Developed by Gimantha Dilshan`);
    console.log(`=================================================${C.reset}\n`);
    console.log(`${C.yellow}[SYSTEM]${C.reset} Initializing Study-It core engines...`);
}

async function handleGlobalBroadcast(socket, broadcast) {
    const { message, id } = broadcast;

    // Dedup: Skip if already being processed by another trigger
    if (processingBroadcasts.has(id)) return;
    processingBroadcasts.add(id);

    console.log(`${C.magenta}[BROADCAST]${C.reset} Transmitting [ID: ${id}]...`);

    try {
        const users = await getAllUsers();
        console.log(`🚀 Sending broadcast to ${users.length} users...`);

        const officialMessage = `📢 *STUDY-IT OFFICIAL ANNOUNCEMENT* 🎓\n` +
            `------------------------------------------\n\n` +
            `${message}\n\n` +
            `------------------------------------------\n` +
            `_Thank you for choosing Study-It. Best of luck with your studies!_ 🚀`;

        const imagePath = './announcement.jpg';
        const hasImage = fs.existsSync(imagePath);

        let successCount = 0;
        for (const user of users) {
            try {
                if (hasImage) {
                    await socket.sendMessage(user, { image: { url: imagePath }, caption: officialMessage });
                } else {
                    await socket.sendMessage(user, { text: officialMessage });
                }
                successCount++;
                await sleep(500); // Delay between recipients to avoid bans
            } catch (err) {
                console.error(`Failed to broadcast to ${user}:`, err);
            }
        }

        await supabase.from('broadcasts').update({ status: 'sent' }).eq('id', id);
        console.log(`✅ Broadcast [ID: ${id}] completed! (${successCount}/${users.length} transmitted)`);
    } catch (err) {
        console.error(`❌ Broadcast [ID: ${id}] failed:`, err.message);
    } finally {
        processingBroadcasts.delete(id);
    }
}

async function pollPendingBroadcasts(socket) {
    try {
        const { data: pending } = await supabase
            .from('broadcasts')
            .select('*')
            .eq('status', 'pending');

        if (pending && pending.length > 0) {
            console.log(`${C.magenta}[BROADCAST POLL]${C.reset} Found ${pending.length} pending. Processing...`);
            for (const b of pending) {
                await handleGlobalBroadcast(socket, b);
            }
        }
    } catch (err) {
        console.error(`${C.red}[BROADCAST POLL]${C.reset} Error:`, err.message);
    }
}

async function startBroadcastListener(socket) {
    console.log(`${C.magenta}[BROADCAST]${C.reset} Initializing Global Listener...`);

    // --- Catch-up: Process any pending broadcasts from when bot was offline ---
    await pollPendingBroadcasts(socket);

    // --- Realtime: Instant delivery when Supabase Realtime is properly configured ---
    const channel = supabase
        .channel('broadcasts-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'broadcasts' }, async (payload) => {
            const { eventType, new: newRow } = payload;
            
            if (eventType !== 'INSERT' && eventType !== 'UPDATE') return;
            if (newRow.status !== 'pending') return;

            console.log(`${C.magenta}[BROADCAST]${C.reset} Realtime ${eventType} [ID: ${newRow.id}]`);
            await handleGlobalBroadcast(socket, newRow);
        });

    channel.subscribe((status, error) => {
        if (status === 'SUBSCRIBED') {
            console.log(`${C.green}[DATABASE]${C.reset} Broadcast Channel: ${C.bold}${C.green}READY (Realtime + Polling every ${POLL_INTERVAL / 1000}s)${C.reset}`);
        } else if (status === 'CLOSED') {
            console.log(`${C.red}[DATABASE]${C.reset} Broadcast Channel: ${C.bold}CLOSED${C.reset}`);
        } else if (status === 'CHANNEL_ERROR') {
            console.error(`${C.red}[DATABASE]${C.reset} Broadcast Channel: ${C.bold}ERROR${C.reset}`, error?.message || '');
            console.log('Tip: Run this SQL in Supabase: ALTER PUBLICATION supabase_realtime ADD TABLE broadcasts;');
        }
    });

    // --- Polling Fallback: Guarantees delivery even if Realtime is misconfigured ---
    setInterval(() => pollPendingBroadcasts(socket), POLL_INTERVAL);
}

async function pollPendingRegistrations(socket) {
    try {
        const { data: pending } = await supabase
            .from('registration_events')
            .select('*')
            .eq('status', 'pending');

        if (pending && pending.length > 0) {
            console.log(`${C.magenta}[REGISTRATION POLL]${C.reset} Found ${pending.length} pending. Processing...`);
            for (const event of pending) {
                await handleRegistrationEvent(socket, event);
            }
        }
    } catch (err) {
        console.error(`${C.red}[REGISTRATION POLL]${C.reset} Error:`, err.message);
    }
}

async function startRegistrationListener(socket) {
    console.log(`${C.magenta}[REGISTRATION]${C.reset} Initializing Global Listener...`);

    // --- Catch-up: Process any pending registrations from when bot was offline ---
    await pollPendingRegistrations(socket);

    // --- Realtime: Instant delivery when Supabase Realtime is properly configured ---
    const channel = supabase
        .channel('registrations-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'registration_events' }, async (payload) => {
            const { eventType, new: newRow } = payload;
            
            if (eventType !== 'INSERT' && eventType !== 'UPDATE') return;
            if (newRow.status !== 'pending') return;

            console.log(`${C.magenta}[REGISTRATION]${C.reset} Realtime ${eventType} for: ${newRow.jid}`);
            await handleRegistrationEvent(socket, newRow);
        });

    channel.subscribe((status, error) => {
        if (status === 'SUBSCRIBED') {
            console.log(`${C.green}[DATABASE]${C.reset} Registration Channel: ${C.bold}${C.green}READY (Realtime + Polling every ${POLL_INTERVAL / 1000}s)${C.reset}`);
        } else if (status === 'CLOSED') {
            console.log(`${C.red}[DATABASE]${C.reset} Registration Channel: ${C.bold}CLOSED${C.reset}`);
        } else if (status === 'CHANNEL_ERROR') {
            console.error(`${C.red}[DATABASE]${C.reset} Registration Channel: ${C.bold}ERROR${C.reset}`, error?.message || '');
            console.log('Tip: Run this SQL in Supabase: ALTER PUBLICATION supabase_realtime ADD TABLE registration_events;');
        }
    });

    // --- Polling Fallback: Guarantees delivery even if Realtime is misconfigured ---
    setInterval(() => pollPendingRegistrations(socket), POLL_INTERVAL);
}

// Helper to handle the actual messaging and DB update
async function handleRegistrationEvent(socket, event) {
    const { jid, id } = event;

    // Dedup: Skip if already being processed by another trigger
    if (processingRegistrations.has(id)) return;
    processingRegistrations.add(id);

    console.log(`${C.magenta}[REGISTRATION]${C.reset} Processing ID: ${id} for: ${jid}`);

    const welcomePro = `🎉 *CONGRATULATIONS!* 🎓✨\n\n` +
        `You have successfully registered on our website. Your account has been upgraded to *PRO TIER!* 💎\n\n` +
        `🚀 *New Daily Limit:* 100 Messages\n` +
        `⚡ *Priority Access:* Faster AI responses\n` +
        `📝 *Deep Analytics:* Full tracking enabled\n\n` +
        `Thank you for choosing Study-It. Let's get back to learning! 📚🎒🚀`;

    try {
        console.log(`[REGISTRATION] Attempting to send message to ${jid}...`);
        
        // Safety timeout: If the socket hangs for more than 10 seconds, skip the message
        await Promise.race([
            socket.sendMessage(jid, { text: welcomePro }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('WhatsApp Send Timeout')), 10000))
        ]);

        console.log(`[REGISTRATION] Message successfully sent!`);
    } catch (err) {
        console.error(`[REGISTRATION] Error/Timeout during send:`, err.message || err);
    } finally {
        // ALWAYS mark as processed so we don't get stuck in a loop on every restart
        // ALSO: Ensure the user is actually marked as registered in the DB
        try {
            await supabase.from('users').update({ is_registered: true }).eq('jid', jid);
            await supabase.from('registration_events').update({ status: 'processed' }).eq('id', id);
            console.log(`[REGISTRATION] Profile upgraded & Event marked as PROCESSED`);
        } catch (dbErr) {
            console.error(`[REGISTRATION] Failed to update DB status:`, dbErr.message);
        }
        processingRegistrations.delete(id);
    }
}

async function connectToWhatsApp() {
    printHeader();
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
        let phoneNumber = process.env.BOT_NUMBER;

        if (!phoneNumber) {
            phoneNumber = await question('Enter your WhatsApp number (with country code, e.g., 94771234567): ');
        } else {
            console.log(`\n${C.yellow}[SYSTEM]${C.reset} Pairing with preset bot number: ${C.cyan}${phoneNumber}${C.reset}`);
        }

        // Give the socket some time to initialize before requesting the code
        console.log('Waiting for socket to be ready for pairing code...');
        setTimeout(async () => {
            try {
                const code = await socket.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                console.log(`\n=================================================`);
                console.log(`   YOUR PAIRING CODE: ${C.green}${C.bold}${code}${C.reset}`);
                console.log(`=================================================\n`);
            } catch (err) {
                console.error('Failed to request pairing code:', err);
                console.log('Tip: If you see "Connection Closed", try running the bot again and double check your number.');
            }
        }, 6000); // 6s delay to ensure socket is ready
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
            console.log(`\n${C.green}${C.bold}[SUCCESS] Connected to WhatsApp!${C.reset}`);
            console.log(`${C.green}[SYSTEM] Study-It is now online and listening for messages. 🚀${C.reset}\n`);
            
            // Wait 2 seconds for Supabase background connection to stabilize before subscribing
            setTimeout(() => {
                startBroadcastListener(socket);
                startRegistrationListener(socket);
            }, 2000);
        }
    });

    socket.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        // 🛑 PREVENTS QUOTA EXCEEDED: Ignore messages older than 60 seconds
        const msgTimestamp = msg.messageTimestamp;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (currentTimestamp - msgTimestamp > 60) {
            console.log('Skipping old message to save Gemini quota.');
            return;
        }

        const pushName = msg.pushName || "";
        const remoteJid = msg.key.remoteJid;
        const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const imageMessage = msg.message.imageMessage;
        const audioMessage = msg.message.audioMessage;
        const documentMessage = msg.message.documentMessage;

        try {
            // PHONE DETECTION (For LID Support)
            const altId = msg.key.remoteJidAlt || msg.key.participantAlt || "";
            let detectedPhone = null;
            if (altId.includes("@s.whatsapp.net")) {
                detectedPhone = altId.split("@")[0];
            }

            // Send welcome message if it's the first time seeing this user
            if (!(await isUserSeen(remoteJid))) {
                await socket.sendMessage(remoteJid, { text: WELCOME_MESSAGE });
                await markUserAsSeen(remoteJid, detectedPhone, pushName);
                return;
            }

            // Check Quota and Registration Status
            const userProfile = await getUserProfile(remoteJid);
            const isRegistered = userProfile?.is_registered || false;
            const currentUsage = userProfile?.daily_usage || 0;

            // Define Limits
            const FREE_LIMIT = 5;
            const REGISTERED_LIMIT = 100;
            const limit = isRegistered ? REGISTERED_LIMIT : FREE_LIMIT;

            // Admin bypass
            const isAdmin = remoteJid === ADMIN_NUMBER;

            if (imageMessage) {
                // Quota check for images
                if (!isAdmin && currentUsage >= limit) {
                    const webUrl = "https://studyit-register.vercel.app/";
                    await socket.sendMessage(remoteJid, {
                        text: `⚠️ *Daily Limit Reached!* 🎓\n\nYou have used your *${limit}/${limit}* free messages for today.\n\n✨ *Want more?* Register for free on our website to get *${REGISTERED_LIMIT}* messages per day!\n\n🔗 *Register here:* ${webUrl}`
                    }, { quoted: msg });
                    return;
                }

                console.log(`${C.cyan}[INCOMING]${C.reset} Image from ${remoteJid}`);
                const stream = await downloadContentFromMessage(imageMessage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                const base64Image = buffer.toString('base64');
                const caption = imageMessage.caption || "Analyze this homework image.";

                // Save user image message
                await saveMessage(remoteJid, 'user', caption, 'image');

                await socket.sendMessage(remoteJid, { text: "Thinking about your image... 🧐" }, { quoted: msg });
                const aiResponse = await askGemini(remoteJid, caption, [{ mimeType: 'image/jpeg', data: base64Image }]);

                await incrementUsage(remoteJid);
                await socket.sendMessage(remoteJid, { text: aiResponse }, { quoted: msg });

                // Save AI response
                await saveMessage(remoteJid, 'model', aiResponse, 'text');

            } else if (audioMessage) {
                // Quota check for audio
                if (!isAdmin && currentUsage >= limit) {
                    const webUrl = "https://studyit-register.vercel.app/";
                    await socket.sendMessage(remoteJid, {
                        text: `⚠️ *Daily Limit Reached!* 🎓\n\nYou have used your *${limit}/${limit}* free messages for today.\n\n✨ *Want more?* Register for free on our website to get *${REGISTERED_LIMIT}* messages per day!\n\n🔗 *Register here:* ${webUrl}`
                    }, { quoted: msg });
                    return;
                }

                console.log(`${C.cyan}[INCOMING]${C.reset} Voice note from ${remoteJid}`);
                const stream = await downloadContentFromMessage(audioMessage, 'audio');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                const base64Audio = buffer.toString('base64');

                // Save user audio message
                await saveMessage(remoteJid, 'user', '[Audio Message]', 'audio');

                await socket.sendMessage(remoteJid, { text: "Listening to your voice note... 👂" }, { quoted: msg });

                const aiResponse = await askGemini(remoteJid, "User sent a voice note. Listen and respond.", [{ mimeType: 'audio/ogg', data: base64Audio }]);

                await incrementUsage(remoteJid);
                await socket.sendMessage(remoteJid, { text: aiResponse }, { quoted: msg });

                // Save AI response
                await saveMessage(remoteJid, 'model', aiResponse, 'text');

            } else if (documentMessage && documentMessage.mimetype === 'application/pdf') {
                // Quota check for documents
                if (!isAdmin && currentUsage >= limit) {
                    const webUrl = "https://studyit-register.vercel.app/";
                    await socket.sendMessage(remoteJid, {
                        text: `⚠️ *Daily Limit Reached!* 🎓\n\nYou have used your *${limit}/${limit}* free messages for today.\n\n✨ *Want more?* Register for free on our website to get *${REGISTERED_LIMIT}* messages per day!\n\n🔗 *Register here:* ${webUrl}`
                    }, { quoted: msg });
                    return;
                }

                console.log(`${C.cyan}[INCOMING]${C.reset} PDF from ${remoteJid}`);
                const stream = await downloadContentFromMessage(documentMessage, 'document');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                const base64Pdf = buffer.toString('base64');
                const caption = documentMessage.caption || "Analyze this PDF document.";

                // Save user document message
                await saveMessage(remoteJid, 'user', '[PDF Document]', 'document');

                await socket.sendMessage(remoteJid, { text: "Reading your document... 📄" }, { quoted: msg });
                const aiResponse = await askGemini(remoteJid, caption, [{ mimeType: 'application/pdf', data: base64Pdf }]);

                await incrementUsage(remoteJid);
                await socket.sendMessage(remoteJid, { text: aiResponse }, { quoted: msg });

                // Save AI response
                await saveMessage(remoteJid, 'model', aiResponse, 'text');

            } else if (textMessage) {
                // COMMAND HANDLING (Admin Only)
                // LID Support (Baileys 7.0.0+): Check both the primary JID and the Alternate JID (Phone Number)
                const remoteJidAlt = msg.key.remoteJidAlt;
                const participantAlt = msg.key.participantAlt;
                const isNumberMatch =
                    remoteJid.includes(ADMIN_NUMBER) ||
                    (remoteJidAlt && remoteJidAlt.includes(ADMIN_NUMBER)) ||
                    (participantAlt && participantAlt.includes(ADMIN_NUMBER));

                const effectivelyAdmin = isNumberMatch;

                if (effectivelyAdmin) {
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
                    return;
                }

                // Quota check for text AI
                if (!effectivelyAdmin && currentUsage >= limit) {
                    const webUrl = "https://studyit-register.vercel.app/";
                    await socket.sendMessage(remoteJid, {
                        text: `⚠️ *Daily Limit Reached!* 🎓\n\nYou have used your *${limit}/${limit}* free messages for today.\n\n✨ *Want more?* Register for free on our website to get *${REGISTERED_LIMIT}* messages per day!\n\n🔗 *Register here:* ${webUrl}`
                    }, { quoted: msg });
                    return;
                }

                console.log(`${C.cyan}[INCOMING]${C.reset} Message from ${remoteJid}: ${textMessage}`);
                await socket.readMessages([msg.key]);
                await socket.sendPresenceUpdate('composing', remoteJid);

                // Save user text message
                await saveMessage(remoteJid, 'user', textMessage, 'text');

                const aiResponse = await askGemini(remoteJid, textMessage);

                await incrementUsage(remoteJid);
                await socket.sendPresenceUpdate('paused', remoteJid);
                await socket.sendMessage(remoteJid, { text: aiResponse }, { quoted: msg });

                // Save AI response
                await saveMessage(remoteJid, 'model', aiResponse, 'text');
            }
        } catch (error) {
            console.error('Error processing message:', error);
            await socket.sendMessage(remoteJid, { text: "I'm temporarily unavailable. Please try again in 1 minute! 🧠💤" }, { quoted: msg });
        }
    });
}

connectToWhatsApp();