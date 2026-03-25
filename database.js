import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

/**
 * Initializes the SQLite database and creates necessary tables
 */
export async function initDB() {
    db = await open({
        filename: './study_it.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jid TEXT,
            role TEXT,
            content TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS seen_users (
            jid TEXT PRIMARY KEY,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    console.log('Database initialized successfully.');
}

/**
 * Saves a message to the database
 */
export async function saveMessage(jid, role, content) {
    await db.run(
        'INSERT INTO messages (jid, role, content) VALUES (?, ?, ?)',
        [jid, role, content]
    );
}

/**
 * Gets the last N messages for a specific user
 */
export async function getChatHistory(jid, limit = 10) {
    const rows = await db.all(
        'SELECT role, content FROM (SELECT * FROM messages WHERE jid = ? ORDER BY id DESC LIMIT ?) ORDER BY id ASC',
        [jid, limit]
    );
    
    return rows.map(row => ({
        role: row.role,
        parts: [{ text: row.content }]
    }));
}

/**
 * Checks if a user has been seen before
 */
export async function isUserSeen(jid) {
    const row = await db.get('SELECT jid FROM seen_users WHERE jid = ?', [jid]);
    return !!row;
}

/**
 * Marks a user as seen
 */
export async function markUserAsSeen(jid) {
    await db.run('INSERT OR IGNORE INTO seen_users (jid) VALUES (?)', [jid]);
}

/**
 * Deletes all messages for a specific user
 */
export async function clearChatHistory(jid) {
    await db.run('DELETE FROM messages WHERE jid = ?', [jid]);
}

/**
 * Resets the "seen" status for a specific user
 */
export async function resetUserStatus(jid) {
    await db.run('DELETE FROM seen_users WHERE jid = ?', [jid]);
}

/**
 * Gets overall bot statistics
 */
export async function getAdminStats() {
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM seen_users');
    const totalMessages = await db.get('SELECT COUNT(*) as count FROM messages');
    return {
        users: totalUsers.count,
        messages: totalMessages.count
    };
}

/**
 * Gets all registered users for broadcasting
 */
export async function getAllUsers() {
    const rows = await db.all('SELECT jid FROM seen_users');
    return rows.map(row => row.jid);
}
