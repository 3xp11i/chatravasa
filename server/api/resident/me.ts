import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event);
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const client = await serverSupabaseClient<Database>(event);
    const userId = (user as any).sub || (user as any).id;

    // Fetch profile (name)
    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", userId)
      .single();

    if (profileError && profileError.code !== "PGRST116") { // allow 'no rows' without failing hard
      throw createError({ statusCode: 500, statusMessage: profileError.message });
    }

    // Fetch resident (room)
    const { data: resident, error: residentError } = await client
      .from("residents")
      .select("room")
      .eq("id", userId)
      .single();

    if (residentError && residentError.code !== "PGRST116") {
      throw createError({ statusCode: 500, statusMessage: residentError.message });
    }

    const first = profile?.first_name || "";
    const last = profile?.last_name || "";

    return {
      name: [first, last].filter(Boolean).join(" "),
      room: resident?.room || "",
      hasProfile: !!profile,
      hasResident: !!resident,
    };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({ statusCode: 500, statusMessage: error.message || "Internal server error" });
  }
});
