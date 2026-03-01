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
  const month_index = parseInt(query.month_index as string)

  if (!resident_id || month_index === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
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

  // Get payment history for the resident
  const { data: payments, error } = await client
    .from('resident_fee_payments')
    .select('*')
    .eq('resident_id', resident_id)
    .eq('month_index', month_index)
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
