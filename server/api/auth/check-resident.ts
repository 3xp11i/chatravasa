import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { phone } = body;
    console.log("Received phone number:", phone);

    if (!phone) {
      throw createError({
        statusCode: 400,
        statusMessage: "Phone number is required",
      });
    }

    const client = serverSupabaseServiceRole(event);

    // Normalize phone number: remove '+' prefix for comparison with auth.users
    // auth.users stores phone without '+' (e.g., '919170147764')
    // but resident_invites may have it with '+' (e.g., '+919170147764')
    const normalizedPhone = phone.startsWith('+') ? phone.slice(1) : phone;
    const phoneWithPlus = phone.startsWith('+') ? phone : '+' + phone;

    console.log("Normalized phone:", normalizedPhone, "Phone with plus:", phoneWithPlus);

    // Check if user exists in auth.users
    // Note: listUsers() can be slow with many users, but it's the only way to check phone
    // Consider implementing caching if this becomes a performance issue
    let authUsers;
    let authError;
    
    try {
      const result = await client.auth.admin.listUsers();
      authUsers = result.data;
      authError = result.error;
      console.log("Auth users fetched:", authUsers?.users?.length || 0, "users");
    } catch (err) {
      console.error("Exception fetching auth users:", err);
      authError = err;
    }

    if (authError) {
      console.error("Auth error:", authError);
      // Don't fail completely - continue to check resident_invites
      // This allows signup for invited residents even if auth check fails
      console.warn("Skipping auth.users check due to error, will check resident_invites only");
    }

    // Compare with normalized phone (without '+')
    const userExists = authUsers?.users?.some((u) => {
      const uPhone = u.phone ? (u.phone.startsWith('+') ? u.phone.slice(1) : u.phone) : '';
      const matches = uPhone === normalizedPhone || u.phone === phone || u.phone === phoneWithPlus;
      if (matches) {
        console.log("Found matching user:", u.id, u.phone);
      }
      return matches;
    }) || false;

    console.log("User exists in auth.users:", userExists);

    // Check if phone exists in resident_invites (try both formats)
    let invites = [];
    
    console.log("Checking resident_invites for phone:", phone);
    
    // First try with the exact phone format sent
    const { data: invitesExact, error: inviteError1 } = await client
      .from("resident_invites")
      .select("id")
      .eq("phone", phone);

    if (inviteError1) {
      console.error("Invite check error (exact):", inviteError1);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to check invitation status",
      });
    }

    console.log("Invites found (exact match):", invitesExact?.length || 0);

    // If not found, try with normalized format
    if (!invitesExact || invitesExact.length === 0) {
      console.log("Checking resident_invites for normalized phone:", normalizedPhone);
      
      const { data: invitesNormalized, error: inviteError2 } = await client
        .from("resident_invites")
        .select("id")
        .eq("phone", normalizedPhone);

      if (inviteError2) {
        console.error("Invite check error (normalized):", inviteError2);
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to check invitation status",
        });
      }

      console.log("Invites found (normalized match):", invitesNormalized?.length || 0);
      invites = invitesNormalized || [];
    } else {
      invites = invitesExact || [];
    }

    // Also try with phoneWithPlus if not found yet
    if (invites.length === 0) {
      console.log("Checking resident_invites for phone with plus:", phoneWithPlus);
      
      const { data: invitesWithPlus, error: inviteError3 } = await client
        .from("resident_invites")
        .select("id")
        .eq("phone", phoneWithPlus);

      if (!inviteError3) {
        console.log("Invites found (with plus):", invitesWithPlus?.length || 0);
        invites = invitesWithPlus || [];
      }
    }

    const isInvited = invites && invites.length > 0;

    console.log("Final result - userExists:", userExists, "isInvited:", isInvited);

    return {
      exists: userExists,
      invited: isInvited,
      canProceed: userExists || isInvited,
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    console.error("Error in check-resident API:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error",
    });
  }
});
