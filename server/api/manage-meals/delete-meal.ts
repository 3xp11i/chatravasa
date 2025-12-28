import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server"
import { isStaffForHostel, staffHasPermission } from "#imports"

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
    const client = await serverSupabaseClient(event)

    const body = await readBody<{ hostel_slug: string; meal_id: string }>(event)
    const { hostel_slug, meal_id } = body || ({} as any)
    if (!hostel_slug || !meal_id) {
      throw createError({ statusCode: 400, statusMessage: "hostel_slug and meal_id are required" })
    }

    const userId = user.sub

    // verify ownership
    const { data: mealRow, error: mealErr } = await client
      .from("hostel_meals")
      .select("id, hostel_id")
      .eq("id", meal_id)
      .single()

    if (mealErr || !mealRow) throw createError({ statusCode: 404, statusMessage: "Meal not found" })

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

    // delete menu rows first
    const { error: delMenuErr } = await client
      .from("hostel_weekly_menu")
      .delete()
      .eq("hostel_meal_id", meal_id)
    if (delMenuErr) throw createError({ statusCode: 500, statusMessage: delMenuErr.message })

    // delete meal
    const { error: delMealErr } = await client
      .from("hostel_meals")
      .delete()
      .eq("id", meal_id)
    if (delMealErr) throw createError({ statusCode: 500, statusMessage: delMealErr.message })

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting meal:", error)
    throw error
  }
})
