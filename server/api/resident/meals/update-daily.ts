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
    const { mealId, date, isOpted } = await readBody(event);

    console.log('[update-daily] Called with:', { userId, mealId, date, isOpted });

    if (!mealId || !date || typeof isOpted !== "boolean") {
      console.error('[update-daily] Invalid parameters:', { mealId, date, isOpted });
      throw createError({
        statusCode: 400,
        statusMessage: "mealId, date, and isOpted are required",
      });
    }

    console.log('[update-daily] Attempting upsert for resident:', userId);
    const { data: upsertData, error: upsertError } = await client
      .from("resident_meal_overrides")
      .upsert(
        {
          resident_id: userId,
          meal_id: mealId,
          meal_date: date,
          is_opted: isOpted,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "meal_id,resident_id,meal_date" }
      )
      .select();

    console.log('[update-daily] Upsert response:', { data: upsertData, error: upsertError });

    if (upsertError) {
      console.error('[update-daily] Upsert error:', upsertError);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to save meal choice: ${upsertError.message}`,
      });
    }

    if (!upsertData || upsertData.length === 0) {
      console.error('[update-daily] No data returned from upsert');
      throw createError({
        statusCode: 500,
        statusMessage: 'No data returned from database',
      });
    }

    console.log('[update-daily] Successfully saved:', upsertData[0]);
    return { success: true, data: upsertData[0] };
  } catch (error: any) {
    console.error('[update-daily] Error handler:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error",
    });
  }
});
