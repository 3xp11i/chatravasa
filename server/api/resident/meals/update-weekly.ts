import { getAuthUser, getAuthenticatedClient } from '../../../utils/auth'
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
  try {
    const user = await getAuthUser(event);
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const client = await getAuthenticatedClient(event);
    const userId = (user as any).sub || (user as any).id;
    const { mealId, weekday, choice } = await readBody(event);

    console.log('[update-weekly] Called with:', { userId, mealId, weekday, choice });

    if (!mealId || typeof weekday !== "number" || typeof choice !== "boolean") {
      console.error('[update-weekly] Invalid parameters:', { mealId, weekday, choice });
      throw createError({
        statusCode: 400,
        statusMessage: "mealId, weekday, and choice are required",
      });
    }

    // Validate weekday is served for this meal
    const { data: mealRow, error: mealError } = await client
      .from("hostel_meals")
      .select("id,weekdays")
      .eq("id", mealId)
      .single();

    if (mealError) {
      console.error('[update-weekly] Meal fetch error:', mealError);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch meal info: ${mealError.message}`,
      });
    }

    if (!mealRow) {
      throw createError({ statusCode: 404, statusMessage: "Meal not found" });
    }

    const servedWeekdays: number[] = Array.isArray((mealRow as any).weekdays) ? (mealRow as any).weekdays : [];
    if (!servedWeekdays.includes(weekday)) {
      console.warn('[update-weekly] Weekday not served for meal, rejecting update', { mealId, weekday, servedWeekdays });
      throw createError({ statusCode: 400, statusMessage: "Meal not served on this weekday" });
    }

    // Fetch current status
    console.log('[update-weekly] Fetching current status for resident:', userId, 'meal:', mealId);
    const { data: current, error: fetchError } = await client
      .from("residents_weekly_meal_status")
      .select("is_opted_weekdays, not_opted_weekdays")
      .eq("resident_id", userId)
      .eq("meal_id", mealId)
      .single();

    console.log('[update-weekly] Fetch response:', { current, error: fetchError });

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error('[update-weekly] Fetch error (not PGRST116):', fetchError);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch current status: ${fetchError.message}`,
      });
    }

    // PGRST116 = no rows found, which is fine - we'll create a new record
    if (fetchError && fetchError.code === "PGRST116") {
      console.log('[update-weekly] No existing record (PGRST116), creating new one');
    }

    const isOpted = (current?.is_opted_weekdays || []).filter((d) => d !== weekday);
    const notOpted = (current?.not_opted_weekdays || []).filter((d) => d !== weekday);

    if (choice) {
      isOpted.push(weekday);
    } else {
      notOpted.push(weekday);
    }

    console.log('[update-weekly] Updated arrays:', { isOpted, notOpted });
    console.log('[update-weekly] Attempting upsert...');

    const { data: upsertData, error: upsertError } = await client
      .from("residents_weekly_meal_status")
      .upsert(
        {
          resident_id: userId,
          meal_id: mealId,
          is_opted_weekdays: isOpted,
          not_opted_weekdays: notOpted,
        },
        { onConflict: "meal_id,resident_id" }
      )
      .select();

    console.log('[update-weekly] Upsert response:', { data: upsertData, error: upsertError });

    if (upsertError) {
      console.error('[update-weekly] Upsert error:', upsertError);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to save weekly status: ${upsertError.message}`,
      });
    }

    if (!upsertData || upsertData.length === 0) {
      console.error('[update-weekly] No data returned from upsert');
      throw createError({
        statusCode: 500,
        statusMessage: 'No data returned from database',
      });
    }

    console.log('[update-weekly] Successfully saved:', upsertData[0]);
    return { success: true, data: upsertData[0] };
  } catch (error: any) {
    console.error('[update-weekly] Error handler:', error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error",
    });
  }
});
