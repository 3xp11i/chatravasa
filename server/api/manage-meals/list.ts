import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import { isStaffForHostel, staffHasPermission } from "#imports"

export default defineEventHandler(async (event) => {
  try {
    const user = await getAuthUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }
    const client = await getAuthenticatedClient(event)
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

    // Get meals for hostel
    const { data: meals, error: mealsErr } = await client
      .from("hostel_meals")
      .select("id, name, timing, status_deadline, weekdays")
      .eq("hostel_id", hostel.id)
      .order("created_at", { ascending: true })

    if (mealsErr) {
      throw createError({ statusCode: 500, statusMessage: mealsErr.message })
    }

    if (!meals || meals.length === 0) {
      return { success: true, meals: [] }
    }

    const mealIds = meals.map((m) => m.id)

    // Get weekly menus for these meals
    const { data: menus, error: menuErr } = await client
      .from("hostel_weekly_menu")
      .select("id, hostel_meal_id, weekdays, food")
      .in("hostel_meal_id", mealIds)

    if (menuErr) {
      throw createError({ statusCode: 500, statusMessage: menuErr.message })
    }

    // Build mapping: per meal, per weekday -> food
    const menuByMeal: Record<string, Record<number, string>> = {}
    for (const row of menus || []) {
      if (!menuByMeal[row.hostel_meal_id!]) menuByMeal[row.hostel_meal_id!] = {}
      for (const wd of row.weekdays || []) {
        menuByMeal[row.hostel_meal_id!][wd] = row.food
      }
    }

    const enriched = meals.map((m) => ({
      ...m,
      menu: menuByMeal[m.id] || {},
    }))

    return { success: true, meals: enriched }
  } catch (error: any) {
    console.error("Error listing meals:", error)
    throw error
  }
})
