import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const user = await getAuthUser(event);
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const supabase = await getAuthenticatedClient(event)
    const body = await readBody(event)

    const { first_name, last_name, phone, role_id, hostel_slug } = body

    if (!first_name || !last_name || !phone || !role_id || !hostel_slug) {
        throw createError({
            statusCode: 400,
            statusMessage: 'First name, last name, phone, role, and hostel slug are required'
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

    // Verify the role exists and belongs to this hostel
    const { data: roleData, error: roleError } = await supabase
        .from('hostel_staff_roles')
        .select('id, hostel_id')
        .eq('id', role_id)
        .single()

    if (roleError || !roleData || roleData.hostel_id !== hostel.id) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Role not found or does not belong to this hostel'
        })
    }

    // Add to staff invites
    const { data: inviteData, error: inviteError } = await supabase
        .from('hostel_staff_invites')
        .insert({
            first_name,
            last_name,
            phone,
            role_id
        })
        .select()
        .single()

    if (inviteError) {
        throw createError({
            statusCode: 500,
            message: inviteError.message
        })
    }

    return { 
        staff_invite: inviteData,
        role_id 
    }
})
