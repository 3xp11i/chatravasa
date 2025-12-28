import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server"
import { isStaffForHostel, staffHasPermission } from "#imports"

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    const client = await serverSupabaseClient(event)

    const body = await readBody<{
      hostel_slug: string
      meal_id: string
      name?: string
      timing?: string
      status_deadline?: number
      weekdays?: number[]
      menu?: { weekday: number; food: string }[]
    }>(event)

    const { hostel_slug, meal_id, name, timing, status_deadline, weekdays, menu } = body || ({} as any)
    if (!hostel_slug || !meal_id) {
      throw createError({ statusCode: 400, statusMessage: "hostel_slug and meal_id are required" })
    }

    const userId = user.sub

    // verify meal belongs to current admin via join
    const { data: mealRow, error: mealErr } = await client
      .from("hostel_meals")
      .select("id, hostel_id")
      .eq("id", meal_id)
      .single()

    if (mealErr || !mealRow) {
      throw createError({ statusCode: 404, statusMessage: "Meal not found" })
    }

    const { data: hostel, error: hostelErr } = await client
      .from("hostels")
      .select("id, admin_user_id, hostel_slug")
      .eq("id", mealRow.hostel_id)
      .single()

    if (hostelErr || !hostel) throw createError({ statusCode: 404, statusMessage: "Hostel not found" })
    if (hostel.hostel_slug !== hostel_slug) {
      throw createError({ statusCode: 404, statusMessage: "Hostel slug mismatch" })
    }
    
    const isAdmin = hostel.admin_user_id === userId
    const isStaff = await isStaffForHostel(event, userId, hostel.id)
    const hasPermission = isAdmin || (isStaff && await staffHasPermission(event, userId, hostel.id, "manage_meals"))
    
    if (!hasPermission) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" })
    }

    // Update fields
    const updatePayload: any = {}
    if (typeof name === "string") updatePayload.name = name.trim()
    if (typeof timing === "string") updatePayload.timing = timing
    if (typeof status_deadline === "number") updatePayload.status_deadline = status_deadline
    if (Array.isArray(weekdays)) updatePayload.weekdays = weekdays

    if (Object.keys(updatePayload).length > 0) {
      const { error: updErr } = await client.from("hostel_meals").update(updatePayload).eq("id", meal_id)
      if (updErr) throw createError({ statusCode: 500, statusMessage: updErr.message })
    }

    // Upsert weekly menu if provided: clear and recreate with optimized grouping
    if (Array.isArray(menu)) {
      const { error: delErr } = await client.from("hostel_weekly_menu").delete().eq("hostel_meal_id", meal_id)
      if (delErr) throw createError({ statusCode: 500, statusMessage: delErr.message })

      // Group menu items by food to optimize storage
      const foodGroups: Record<string, number[]> = {}
      for (const item of menu) {
        if (typeof item.weekday === "number" && item.food && item.food.trim()) {
          const food = item.food.trim()
          if (!foodGroups[food]) foodGroups[food] = []
          foodGroups[food].push(item.weekday)
        }
      }

      // Create rows for each unique food
      const rows = Object.entries(foodGroups).map(([food, weekdays]) => ({
        hostel_meal_id: meal_id,
        food,
        weekdays,
      }))

      if (rows.length > 0) {
        const { error: insErr } = await client.from("hostel_weekly_menu").insert(rows)
        if (insErr) throw createError({ statusCode: 500, statusMessage: insErr.message })
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error updating meal:", error)
    throw error
  }
})
