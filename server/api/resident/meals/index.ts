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

    // Fetch resident to get hostel
    const { data: resident, error: residentError } = await client
      .from("residents")
      .select("id, hostel_id")
      .eq("id", userId)
      .maybeSingle();

    if (residentError) {
      console.error("[meals-api] Error fetching resident:", residentError);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch resident: ${residentError.message}`,
      });
    }

    if (!resident || !resident.hostel_id) {
      console.log("[meals-api] No resident record or hostel assignment found for user:", userId);
      // Return empty data for residents not yet assigned to a hostel
      return {
        meals: [],
        weeklyStatus: [],
        overrides: [],
        weeklyMenu: [],
        residentId: userId,
        today: new Date().toISOString().slice(0, 10),
        tomorrow: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      };
    }

    console.log("[meals-api] Resident found:", resident.id, "hostel:", resident.hostel_id);

    // Fetch all meals for hostel
    const { data: meals, error: mealsError } = await client
      .from("hostel_meals")
      .select("*")
      .eq("hostel_id", resident.hostel_id)
      .order("timing");

    if (mealsError) {
      console.error("[meals-api] Error fetching meals:", mealsError);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch meals: ${mealsError.message}`,
      });
    }

    console.log("[meals-api] Found meals:", meals?.length || 0);

    // Fetch weekly meal status
    const { data: weeklyStatus, error: weeklyError } = await client
      .from("residents_weekly_meal_status")
      .select("meal_id, is_opted_weekdays, not_opted_weekdays")
      .eq("resident_id", userId);

    if (weeklyError) {
      console.error("[meals-api] Error fetching weekly status:", weeklyError);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch weekly status: ${weeklyError.message}`,
      });
    }

    console.log("[meals-api] Found weekly status entries:", weeklyStatus?.length || 0);

    // Get today and tomorrow dates
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    // Fetch daily overrides for today and tomorrow
    const { data: overrides, error: overridesError } = await client
      .from("resident_meal_overrides")
      .select("meal_id, meal_date, is_opted")
      .eq("resident_id", userId)
      .in("meal_date", [today, tomorrow]);

    if (overridesError) {
      console.error("[meals-api] Error fetching overrides:", overridesError);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch overrides: ${overridesError.message}`,
      });
    }

    console.log("[meals-api] Found overrides:", overrides?.length || 0);

    // Fetch weekly menu for this hostel's meals only
    const mealIds = meals?.map((m: any) => m.id) || [];
    let filteredMenu: any[] = [];

    if (mealIds.length > 0) {
      const { data: weeklyMenu, error: menuError } = await client
        .from("hostel_weekly_menu")
        .select("id, food, weekdays, hostel_meal_id")
        .in("hostel_meal_id", mealIds);

      if (menuError) {
        console.error("[meals-api] Error fetching menu:", menuError);
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to fetch weekly menu: ${menuError.message}`,
        });
      }

      filteredMenu = weeklyMenu || [];
      console.log("[meals-api] Found menu items:", filteredMenu.length);
    }

    const response = {
      meals: meals || [],
      weeklyStatus: weeklyStatus || [],
      overrides: overrides || [],
      weeklyMenu: filteredMenu,
      residentId: userId,
      today,
      tomorrow,
    };

    console.log("[meals-api] Returning response with", response.meals.length, "meals");
    return response;
  } catch (error: any) {
    console.error("[meals-api] Error handler caught:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Internal server error",
    });
  }
});
