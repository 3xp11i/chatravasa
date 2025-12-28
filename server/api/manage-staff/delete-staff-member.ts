import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const supabase = await serverSupabaseClient<Database>(event)
    const body = await readBody(event)
    const { staff_id, is_invite, hostel_slug } = body

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

    if (is_invite) {
        // Delete from invites table
        const { error } = await supabase
            .from('hostel_staff_invites')
            .delete()
            .eq('id', staff_id)

        if (error) {
            throw createError({
                statusCode: 500,
                message: error.message
            })
        }
    } else {
        // Delete from staff table
        const { error } = await supabase
            .from('hostel_staff')
            .delete()
            .eq('id', staff_id)

        if (error) {
            throw createError({
                statusCode: 500,
                message: error.message
            })
        }
    }

    return { success: true }
})
