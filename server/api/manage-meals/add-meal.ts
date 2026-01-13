import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server"
import { isStaffForHostel, staffHasPermission } from "#imports"

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    }
    const client = await serverSupabaseClient(event)

    const body = await readBody<{
      hostel_slug: string
      name: string
      timing: string
      status_deadline?: number
      weekdays: number[]
      menu?: { weekday: number; food: string }[]
    }>(event)

    const { hostel_slug, name, timing, status_deadline = 120, weekdays, menu } = body || ({} as any)

    if (!hostel_slug || !name?.trim() || !timing || !Array.isArray(weekdays) || weekdays.length === 0) {
      throw createError({ statusCode: 400, statusMessage: "Invalid input data" })
    }

    const userId = user.sub

    // Verify hostel ownership via slug
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
    const hasPermission = isAdmin || (isStaff && await staffHasPermission(event, userId, hostel.id, "manage_meals"))
    
    if (!hasPermission) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" })
    }

    // Insert meal
    const { data: meal, error: insertErr } = await client
      .from("hostel_meals")
      .insert({
        hostel_id: hostel.id,
        name: name.trim(),
        timing,
        status_deadline,
        weekdays,
      })
      .select()
      .single()

    if (insertErr || !meal) {
      throw createError({ statusCode: 500, statusMessage: insertErr?.message || "Failed to add meal" })
    }

    // Insert weekly menu if provided
    if (Array.isArray(menu) && menu.length > 0) {
      // Group menu items by food to optimize storage
      const foodGroups: Record<string, number[]> = {}
      for (const item of menu) {
        if (item.food && item.food.trim()) {
          const food = item.food.trim()
          if (!foodGroups[food]) foodGroups[food] = []
          foodGroups[food].push(item.weekday)
        }
      }

      // Create rows for each unique food
      const menuRows = Object.entries(foodGroups).map(([food, weekdays]) => ({
        hostel_meal_id: meal.id,
        food,
        weekdays,
      }))

      if (menuRows.length > 0) {
        const { error: menuErr } = await client.from("hostel_weekly_menu").insert(menuRows)
        if (menuErr) {
          console.error("Failed to insert weekly menu:", menuErr)
          // Don't fail the whole operation, just log it
        }
      }
    }

    return { success: true, meal }
  } catch (error: any) {
    console.error("Error adding meal:", error)
    throw error
  }
})
