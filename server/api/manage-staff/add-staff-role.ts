import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const supabase = await serverSupabaseClient<Database>(event)
    const body = await readBody(event)

    const {
        hostel_slug,
        title,
        view_residents = false,
        manage_residents = false,
        view_meals = false,
        manage_meals = false,
        view_fees = false,
        manage_fees = false,
        view_complaints = false,
        manage_complaints = false
    } = body

    if (!hostel_slug || !title) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Hostel slug and role title are required'
        })
    }

    // Get the hostel by slug and verify the admin owns it
    const { data: hostel, error: hostelError } = await supabase
        .from('hostels')
        .select('id, admin_user_id')
        .eq('hostel_slug', hostel_slug)
        .single()

    if (hostelError || !hostel) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Hostel not found'
        })
    }

    // Verify the current user is the admin of this hostel
    if (hostel.admin_user_id !== user.sub) {
        throw createError({
            statusCode: 403,
            statusMessage: 'You are not authorized to manage staff for this hostel'
        })
    }

    const { data, error } = await supabase
        .from('hostel_staff_roles')
        .insert({
            hostel_id: hostel.id,
            title,
            view_residents,
            manage_residents,
            view_meals,
            manage_meals,
            view_fees,
            manage_fees,
            view_complaints,
            manage_complaints
        })
        .select()
        .single()

    if (error) {
        throw createError({
            statusCode: 500,
            statusMessage: error.message
        })
    }

    return { role: data }
})
