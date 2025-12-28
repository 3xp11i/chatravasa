import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const supabase = await serverSupabaseClient<Database>(event)
    const body = await readBody(event)

    const { staff_id, role_id, hostel_slug } = body

    if (!staff_id || !hostel_slug) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Staff ID and hostel slug are required'
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

    // If role_id is provided, verify it belongs to this hostel
    if (role_id) {
        const { data: roleData, error: roleError } = await supabase
            .from('hostel_staff_roles')
            .select('hostel_id')
            .eq('id', role_id)
            .single()

        if (roleError || !roleData || roleData.hostel_id !== hostel.id) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Role not found or does not belong to this hostel'
            })
        }
    }

    const updateData: any = {}
    if (role_id !== undefined) updateData.role_id = role_id

    const { data, error } = await supabase
        .from('hostel_staff')
        .update(updateData)
        .eq('id', staff_id)
        .select()
        .single()

    if (error) {
        throw createError({
            statusCode: 500,
            message: error.message
        })
    }

    return { staff: data }
})
