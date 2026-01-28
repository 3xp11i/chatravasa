import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server"
import { isStaffForHostel, staffHasPermission } from "#imports"
import { Database } from "~/types/database.types"

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }
    const client = await serverSupabaseClient(event)
    const query = getQuery(event)
    const hostel_slug = (query.hostel_slug as string) || ""

    if (!hostel_slug) {
      throw createError({ statusCode: 400, statusMessage: "hostel_slug is required" })
    }

    const userId = user.sub

    // Verify hostel and get id
    const { data: hostel, error: hostelErr } = await client
      .from("hostels")
      .select("id, admin_user_id")
      .eq("hostel_slug", hostel_slug)
      .single()

    if (hostelErr || !hostel) {
      throw createError({ statusCode: 404, statusMessage: "Hostel not found" })
    }

    const isAdmin = hostel.admin_user_id === userId
    const isStaff = await isStaffForHostel(event, userId, hostel.id)
    const hasPermission = isAdmin || (isStaff && await staffHasPermission(event, userId, hostel.id, "view_meals"))

    if (!hasPermission) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" })
    }

    // Query the meal_analytics view
    const { data: analytics, error: analyticsErr } = await client
      .from("meal_analytics")
      .select("*")
      .eq("hostel_id", hostel.id)
      .order("meal_name", { ascending: true })
      .order("weekday", { ascending: true })

    if (analyticsErr) {
      throw createError({ statusCode: 500, statusMessage: analyticsErr.message })
    }

    // Get total resident count for this hostel
    const { count: totalResidents, error: countErr } = await client
      .from("residents")
      .select("*", { count: "exact", head: true })
      .eq("hostel_id", hostel.id)

    if (countErr) {
      throw createError({ statusCode: 500, statusMessage: countErr.message })
    }

    // Group analytics by meal
    const mealMap = new Map<string, {
      meal_id: string
      meal_name: string
      timing: string
      status_deadline: number
      meal_weekdays: number[]
      weekly: Record<number, { opted_count: number; meal_served: boolean }>
      today_opted_count: number | null
      tomorrow_opted_count: number | null
      today_weekday: number
      tomorrow_weekday: number
      today: string
      tomorrow: string
    }>()

    for (const row of analytics || []) {
      // Skip rows with null meal_id or weekday
      if (!row.meal_id || row.weekday === null) continue

      if (!mealMap.has(row.meal_id)) {
        mealMap.set(row.meal_id, {
          meal_id: row.meal_id,
          meal_name: row.meal_name ?? '',
          timing: row.timing ?? '',
          status_deadline: row.status_deadline ?? 0,
          meal_weekdays: row.meal_weekdays ?? [],
          weekly: {},
          today_opted_count: null,
          tomorrow_opted_count: null,
          today_weekday: row.today_weekday ?? 0,
          tomorrow_weekday: row.tomorrow_weekday ?? 0,
          today: row.today ?? '',
          tomorrow: row.tomorrow ?? '',
        })
      }

      const meal = mealMap.get(row.meal_id)!

      // Add weekly data
      meal.weekly[row.weekday] = {
        opted_count: row.weekly_opted_count ?? 0,
        meal_served: row.meal_served ?? false,
      }

      // Update today/tomorrow counts if this row contains them
      if (row.today_opted_count !== null) {
        meal.today_opted_count = row.today_opted_count
      }
      if (row.tomorrow_opted_count !== null) {
        meal.tomorrow_opted_count = row.tomorrow_opted_count
      }
    }

    const mealsAnalytics = Array.from(mealMap.values())

    return {
      success: true,
      totalResidents: totalResidents || 0,
      today: analytics?.[0]?.today || new Date().toISOString().split("T")[0],
      tomorrow: analytics?.[0]?.tomorrow || new Date(Date.now() + 86400000).toISOString().split("T")[0],
      todayWeekday: analytics?.[0]?.today_weekday ?? new Date().getDay(),
      tomorrowWeekday: analytics?.[0]?.tomorrow_weekday ?? ((new Date().getDay() + 1) % 7),
      meals: mealsAnalytics,
    }
  } catch (error: any) {
    console.error("Error fetching meal analytics:", error)
    throw error
  }
})
