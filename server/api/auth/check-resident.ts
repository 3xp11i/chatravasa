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

    // Check if user exists in auth.users
    const { data: authUsers, error: authError } = await client.auth.admin.listUsers();

    if (authError) {
      console.error("Auth error:", authError);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to check user status",
      });
    }

    // Compare with normalized phone (without '+')
    const userExists = authUsers.users.some((u) => {
      const uPhone = u.phone ? (u.phone.startsWith('+') ? u.phone.slice(1) : u.phone) : '';
      return uPhone === normalizedPhone || u.phone === phone;
    });

    // Check if phone exists in resident_invites (try both formats)
    let invites = [];
    
    // First try with the exact phone format sent
    const { data: invitesExact, error: inviteError1 } = await client
      .from("resident_invites")
      .select("id")
      .eq("phone", phone);

    if (inviteError1) {
      console.error("Invite check error:", inviteError1);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to check invitation status",
      });
    }

    // If not found, try with normalized format
    if (!invitesExact || invitesExact.length === 0) {
      const { data: invitesNormalized, error: inviteError2 } = await client
        .from("resident_invites")
        .select("id")
        .eq("phone", normalizedPhone);

      if (inviteError2) {
        console.error("Invite check error:", inviteError2);
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to check invitation status",
        });
      }

      invites = invitesNormalized || [];
    } else {
      invites = invitesExact || [];
    }

    const isInvited = invites && invites.length > 0;

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
