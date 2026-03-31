"use server";

import { createClient } from "@supabase/supabase-js";

// Server-side admin client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function registerUser(whatsappNumber: string, email: string) {
  try {
    const pureNumber = whatsappNumber.replace(/\D/g, "");

    if (!pureNumber || pureNumber.length < 8) {
      return { success: false, error: "Please enter a valid WhatsApp number with country code." };
    }

    // Find the user - support both standard JID and the new LID format
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("jid, is_registered")
      .or(`jid.ilike.%${pureNumber}%,phone.ilike.%${pureNumber}%`)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return {
          success: false,
          error: "Number not found. Please send any message to the bot on WhatsApp first so it can recognize you!",
        };
      }
      throw fetchError;
    }

    if (user.is_registered) {
      return { success: false, error: "This account is already registered as Pro!" };
    }

    // Update the user profile to 'is_registered'
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ is_registered: true, email })
      .eq("jid", user.jid);

    if (updateError) throw updateError;

    // Trigger registration event for the WhatsApp bot to send the 'Welcome' message
    const { error: eventError } = await supabaseAdmin
      .from("registration_events")
      .insert({ jid: user.jid });

    if (eventError) throw eventError;

    return { success: true };
  } catch (err: any) {
    console.error("Registration Error:", err);
    return { success: false, error: "A server error occurred. Please try again." };
  }
}
