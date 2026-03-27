import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Initialize Supabase Client
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Initializes the database (Checking connection)
 */
export async function initDB() {
    try {
        const { data, error } = await supabase.from('users').select('id').limit(1);
        if (error) throw error;
        console.log('Successfully connected to Supabase Cloud Database.');
    } catch (error) {
        console.error('Error connecting to Supabase:', error.message);
        console.log('Tip: Make sure you ran the SQL script in your Supabase Editor!');
    }
}

/**
 * Saves a message to the cloud database
 */
export async function saveMessage(jid, role, content) {
    const { error } = await supabase
        .from('messages')
        .insert([{ jid, role, content }]);
    
    if (error) console.error('Error saving message to Supabase:', error.message);
}

/**
 * Gets the last N messages for a specific user from Cloud
 */
export async function getChatHistory(jid, limit = 10) {
    const { data, error } = await supabase
        .from('messages')
        .select('role, content')
        .eq('jid', jid)
        .order('id', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching history:', error.message);
        return [];
    }

    // Return in chronological order (Gemini expects history from oldest to newest)
    return data.reverse().map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
    }));
}

/**
 * Checks if a user has been seen before (and handles daily reset)
 */
export async function isUserSeen(jid) {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('jid', jid)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = NOT FOUND
        console.error('Error checking user:', error.message);
        return false;
    }

    if (!data) return false;

    // Reset usage if it's a new day
    if (data.last_usage_date !== today) {
        await supabase
            .from('users')
            .update({ daily_usage: 0, last_usage_date: today })
            .eq('jid', jid);
    }

    return true;
}

/**
 * Marks a user as seen (Creates profile)
 * Now also stores the linked phone number for easier registration lookup
 */
export async function markUserAsSeen(jid, phone, name) {
    try {
        const { data, error } = await supabase.from('users').upsert([{ 
            jid, 
            phone, 
            name,
            last_usage_date: new Date().toISOString().split('T')[0] 
        }], { onConflict: 'jid' });
        if (error) throw error;
    } catch (error) {
        console.error('Error marking user as seen:', error);
    }
}

/**
 * Gets usage and registration details for a user
 */
export async function getUserProfile(jid) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('jid', jid)
        .single();
    
    return data;
}

/**
 * Increments daily usage for a user
 */
export async function incrementUsage(jid) {
    const { data: user } = await supabase
        .from('users')
        .select('daily_usage')
        .eq('jid', jid)
        .single();
    
    if (user) {
        await supabase
            .from('users')
            .update({ daily_usage: user.daily_usage + 1 })
            .eq('jid', jid);
    }
}

/**
 * Gets overall bot statistics
 */
export async function getAdminStats() {
    const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
    
    const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

    return {
        users: usersCount || 0,
        messages: messagesCount || 0
    };
}

/**
 * Gets all registered users for broadcasting
 */
export async function getAllUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('jid');
    
    return data ? data.map(u => u.jid) : [];
}
