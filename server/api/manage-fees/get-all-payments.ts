import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import type { Database } from "~/types/database.types";
import { isStaffForHostel, staffHasPermission } from "#imports";

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const client = await getAuthenticatedClient(event);
  const query = getQuery(event)

  const resident_id = query.resident_id as string

  if (!resident_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Resident ID is required',
    })
  }

  // Get resident with hostel info to check permissions
  const { data: resident, error: residentError } = await client
    .from('residents')
    .select('hostel_id, hostels!inner(admin_user_id)')
    .eq('id', resident_id)
    .single()

  if (residentError || !resident) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Resident not found',
    })
  }

  // Check if user is admin or staff with view_fees permission
  const isAdmin = resident.hostels.admin_user_id === user.sub;
  
  if (!isAdmin) {
    const isStaff = await isStaffForHostel(event, user.sub, resident.hostel_id);
    if (!isStaff) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    }
    
    const hasViewPermission = await staffHasPermission(event, user.sub, resident.hostel_id, "view_fees");
    if (!hasViewPermission) {
      throw createError({ statusCode: 403, statusMessage: "You do not have permission to view fees" });
    }
  }

  // Get all payments for the resident across all months
  const { data: payments, error } = await client
    .from('resident_fee_payments')
    .select('*')
    .eq('resident_id', resident_id)
    .order('month_index', { ascending: true })
    .order('paid_on', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return {
    payments: payments || [],
  }
})
