import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event);
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const client = await serverSupabaseClient<Database>(event);
    const userId = (user as any).sub || (user as any).id;
    const method = (event as any).node?.req?.method || "POST";

    if (method === "GET") {
      // Return current in-room status, default false if not set
      const { data, error } = await client
        .from("residents_metadata")
        .select("in_room")
        .eq("resident_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw createError({ statusCode: 500, statusMessage: error.message });
      }

      return { success: true, inRoom: data?.in_room ?? false };
    }

    const { inRoom } = await readBody(event);
    if (typeof inRoom !== "boolean") {
      throw createError({
        statusCode: 400,
        statusMessage: "inRoom must be a boolean",
      });
    }

    // Robust update-or-insert without relying on unique constraints
    const { data: updated, error: updateError } = await client
      .from("residents_metadata")
      .update({ in_room: inRoom })
      .eq("resident_id", userId)
      .select();

    if (updateError) {
      throw createError({ statusCode: 500, statusMessage: updateError.message });
    }

    let final = updated?.[0];
    if (!final) {
      const { data: inserted, error: insertError } = await client
        .from("residents_metadata")
        .insert({ resident_id: userId, in_room: inRoom })
        .select();

      if (insertError) {
        throw createError({ statusCode: 500, statusMessage: insertError.message });
      }
      final = inserted?.[0];
    }

    return { success: true, inRoom: final?.in_room ?? inRoom };
  } catch (error: any) {
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error",
    });
  }
});
