import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const user = await getAuthUser(event);
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const supabase = await getAuthenticatedClient(event)
    const body = await readBody(event)
    const { role_id, hostel_slug } = body

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

    // Check if any staff members are assigned to this role
    const { data: staffMembers, error: checkError } = await supabase
        .from('hostel_staff')
        .select('id')
        .eq('role_id', role_id)
        .limit(1)

    if (checkError) {
        throw createError({
            statusCode: 500,
            message: checkError.message
        })
    }

    if (staffMembers && staffMembers.length > 0) {
        throw createError({
            statusCode: 400,
            message: 'Cannot delete role. Staff members are assigned to this role.'
        })
    }

    const { error } = await supabase
        .from('hostel_staff_roles')
        .delete()
        .eq('id', role_id)

    if (error) {
        throw createError({
            statusCode: 500,
            message: error.message
        })
    }

    return { success: true }
})
