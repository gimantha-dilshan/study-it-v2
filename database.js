import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.resolve('./database.json');

// Initial structure
let data = {
    messages: [],
    seenUsers: [] // Stores JIDs
};

/**
 * Initializes the JSON database
 */
export async function initDB() {
    try {
        const fileContent = await fs.readFile(DB_PATH, 'utf-8');
        data = JSON.parse(fileContent);
        console.log('Database loaded successfully from JSON.');
    } catch (error) {
        if (error.code === 'ENOENT') {
            await saveToDisk();
            console.log('New database.json created.');
        } else {
            console.error('Error loading database:', error);
        }
    }
}

/**
 * Saves the current in-memory state to the JSON file
 */
async function saveToDisk() {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving to disk:', error);
    }
}

/**
 * Saves a message to the database
 */
export async function saveMessage(jid, role, content) {
    data.messages.push({
        jid,
        role,
        content,
        timestamp: new Date().toISOString()
    });
    await saveToDisk();
}

/**
 * Gets the last N messages for a specific user
 */
export async function getChatHistory(jid, limit = 10) {
    const userMessages = data.messages
        .filter(m => m.jid === jid)
        .slice(-limit); // Get the last N
    
    return userMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
    }));
}

/**
 * Checks if a user has been seen before
 */
export async function isUserSeen(jid) {
    return data.seenUsers.includes(jid);
}

/**
 * Marks a user as seen
 */
export async function markUserAsSeen(jid) {
    if (!data.seenUsers.includes(jid)) {
        data.seenUsers.push(jid);
        await saveToDisk();
    }
}

/**
 * Gets overall bot statistics
 */
export async function getAdminStats() {
    return {
        users: data.seenUsers.length,
        messages: data.messages.length
    };
}

/**
 * Gets all registered users for broadcasting
 */
export async function getAllUsers() {
    return data.seenUsers;
}
