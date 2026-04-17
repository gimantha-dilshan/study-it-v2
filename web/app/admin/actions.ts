"use server";

import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";

// Server-side admin client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redis = Redis.fromEnv();

export async function verifyAdminPasscode(input: string) {
  const secret = process.env.ADMIN_PASSCODE;
  if (!secret) return { success: false, error: "Server Configuration Error" };
  if (input === secret) return { success: true };
  return { success: false, error: "Incorrect Passcode" };
}

export async function getAdminData(passcode: string) {
  const secret = process.env.ADMIN_PASSCODE;
  if (!secret || passcode !== secret) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { data: users, error: uError } = await supabaseAdmin
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: messages, error: mError } = await supabaseAdmin
      .from("messages")
      .select("*");

    const { data: broadcasts, error: bError } = await supabaseAdmin
      .from("broadcasts")
      .select("*")
      .order("created_at", { ascending: false });

    if (uError || mError || bError) throw new Error("Database error");

    return {
      success: true,
      data: {
        users: users || [],
        messages: messages || [],
        broadcasts: broadcasts || [],
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getAdminUserMessages(passcode: string, jid: string) {
  const secret = process.env.ADMIN_PASSCODE;
  if (!secret || passcode !== secret) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { data: messages, error } = await supabaseAdmin
      .from("messages")
      .select("*")
      .eq("jid", jid)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: messages || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createBroadcast(passcode: string, message: string, targetJids: string[] | null = null) {
  const secret = process.env.ADMIN_PASSCODE;
  if (!secret || passcode !== secret) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("broadcasts")
      .insert([{ message, status: "pending", target_jids: targetJids }])
      .select()
      .single();

    if (error) throw error;
    
    // Instant Delivery: Push to Upstash Redis queue.
    try {
      const restUrl = process.env.UPSTASH_REDIS_REST_URL;
      const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;
      console.log(`[REDIS DEBUG] REST URL present: ${!!restUrl}, Token present: ${!!restToken}`);
      
      const pushResult = await redis.lpush("queue:broadcasts", JSON.stringify({ id: data.id, message, target_jids: targetJids }));
      console.log(`[REDIS DEBUG] lpush result (queue length):`, pushResult);
    } catch (redisErr: any) {
      console.error("[REDIS ERROR] Push failed:", redisErr?.message || redisErr);
    }
    return { success: true, data };
  } catch (err: any) {
    console.error("Create Broadcast Error:", err);
    return { success: false, error: err.message || "Failed to queue broadcast." };
  }
}
