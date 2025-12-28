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
        role_id,
        hostel_slug,
        title,
        view_residents,
        manage_residents,
        view_meals,
        manage_meals,
        view_fees,
        manage_fees,
        view_complaints,
        manage_complaints
    } = body

    if (!role_id || !hostel_slug) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Role ID and hostel slug are required'
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

    // Verify the role belongs to this hostel
    const { data: existingRole, error: roleCheckError } = await supabase
        .from('hostel_staff_roles')
        .select('hostel_id')
        .eq('id', role_id)
        .single()

    if (roleCheckError || !existingRole || existingRole.hostel_id !== hostel.id) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Role not found or does not belong to this hostel'
        })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (view_residents !== undefined) updateData.view_residents = view_residents
    if (manage_residents !== undefined) updateData.manage_residents = manage_residents
    if (view_meals !== undefined) updateData.view_meals = view_meals
    if (manage_meals !== undefined) updateData.manage_meals = manage_meals
    if (view_fees !== undefined) updateData.view_fees = view_fees
    if (manage_fees !== undefined) updateData.manage_fees = manage_fees
    if (view_complaints !== undefined) updateData.view_complaints = view_complaints
    if (manage_complaints !== undefined) updateData.manage_complaints = manage_complaints

    const { data, error } = await supabase
        .from('hostel_staff_roles')
        .update(updateData)
        .eq('id', role_id)
        .select()
        .single()

    if (error) {
        throw createError({
            statusCode: 500,
            message: error.message
        })
    }

    return { role: data }
})
