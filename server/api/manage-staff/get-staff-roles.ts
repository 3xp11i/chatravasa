import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const user = await getAuthUser(event);
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const supabase = await getAuthenticatedClient(event)
    const query = getQuery(event)
    const hostel_slug = query.hostel_slug as string

    if (!hostel_slug) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Hostel slug is required'
        })
    }

    // Get the hostel by slug and verify the admin owns it
    const { data: hostelData, error: hostelError } = await supabase
        .from('hostels')
        .select('id, admin_user_id')
        .eq('hostel_slug', hostel_slug)
        .single()

    if (hostelError || !hostelData) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Hostel not found'
        })
    }

    // Verify the current user is the admin of this hostel
    if (hostelData.admin_user_id !== user.sub) {
        throw createError({
            statusCode: 403,
            statusMessage: 'You are not authorized to view staff for this hostel'
        })
    }

    const { data: roles, error } = await supabase
        .from('hostel_staff_roles')
        .select('*')
        .eq('hostel_id', hostelData.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching roles:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to fetch roles'
        })
    }

    return { 
        roles: roles || [],
        hostel_id: hostelData.id
    }
})
