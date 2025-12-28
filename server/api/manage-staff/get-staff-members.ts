import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const supabase = await serverSupabaseClient<Database>(event)
    const query = getQuery(event)
    const hostel_slug = query.hostel_slug as string
    const limit = query.limit ? parseInt(query.limit as string) : 10
    const offset = query.offset ? parseInt(query.offset as string) : 0

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

    // Get all roles for this hostel
    const { data: roles, error: rolesError } = await supabase
        .from('hostel_staff_roles')
        .select('id')
        .eq('hostel_id', hostelData.id)

    if (rolesError) {
        throw createError({
            statusCode: 500,
            message: rolesError.message
        })
    }

    const roleIds = roles.map((r: any) => r.id)

    if (roleIds.length === 0) {
        return { staff_members: [], total: 0 }
    }

    // Get confirmed staff members
    const { data: confirmedStaff, error: staffError } = await supabase
        .from('hostel_staff')
        .select(`
            id,
            created_at,
            role_id,
            staff_member_id,
            hostel_staff_roles (
                id,
                title
            ),
            profiles (
                id,
                first_name,
                last_name,
                phone,
                avatar
            )
        `)
        .in('role_id', roleIds)
        .range(offset, offset + limit - 1)

    if (staffError) {
        throw createError({
            statusCode: 500,
            message: staffError.message
        })
    }

    // Get total count
    const { count, error: countError } = await supabase
        .from('hostel_staff')
        .select('id', { count: 'exact', head: true })
        .in('role_id', roleIds)

    if (countError) {
        throw createError({
            statusCode: 500,
            message: countError.message
        })
    }

    // Get pending invites for roles in this hostel
    const { data: invites, error: invitesError } = await supabase
        .from('hostel_staff_invites')
        .select('*')
        .in('role_id', roleIds)
        .order('created_at', { ascending: false })

    if (invitesError) {
        throw createError({
            statusCode: 500,
            message: invitesError.message
        })
    }

    // Merge confirmed staff and invites
    const staffMembers = [
        ...confirmedStaff.map((staff: any) => ({
            id: staff.id,
            staff_id: staff.staff_member_id,
            first_name: staff.profiles?.first_name || '',
            last_name: staff.profiles?.last_name || '',
            phone: staff.profiles?.phone || '',
            avatar: staff.profiles?.avatar || null,
            role_id: staff.role_id,
            role_title: staff.hostel_staff_roles?.title || '',
            is_invite: false,
            created_at: staff.created_at
        })),
        ...invites.map((invite: any) => ({
            id: invite.id,
            first_name: invite.first_name || '',
            last_name: invite.last_name || '',
            phone: invite.phone || '',
            avatar: null,
            role_id: null,
            role_title: 'Pending',
            is_invite: true,
            created_at: invite.created_at
        }))
    ]

    return {
        staff_members: staffMembers,
        total: (count || 0) + invites.length
    }
})
