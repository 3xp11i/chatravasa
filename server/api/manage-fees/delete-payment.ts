import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'
import type { Database } from "~/types/database.types";
import { isStaffForHostel, staffHasPermission } from "#imports";

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const client = await getAuthenticatedClient(event);
  const body = await readBody(event)

  const { payment_id } = body

  if (!payment_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Payment ID is required',
    })
  }

  // Get payment with resident and hostel info to check permissions
  const { data: payment, error: paymentError } = await client
    .from('resident_fee_payments')
    .select('resident_id, residents!inner(hostel_id, hostels!inner(admin_user_id))')
    .eq('id', payment_id)
    .single()

  if (paymentError || !payment) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Payment not found',
    })
  }

  // Check if user is admin or staff with manage_fees permission
  const isAdmin = payment.residents.hostels.admin_user_id === user.sub;
  
  if (!isAdmin) {
    const isStaff = await isStaffForHostel(event, user.sub, payment.residents.hostel_id);
    if (!isStaff) {
      throw createError({ statusCode: 403, statusMessage: "Forbidden" });
    }
    
    const hasManagePermission = await staffHasPermission(event, user.sub, payment.residents.hostel_id, "manage_fees");
    if (!hasManagePermission) {
      throw createError({ statusCode: 403, statusMessage: "You do not have permission to manage fees" });
    }
  }

  // Delete payment
  const { error } = await client
    .from('resident_fee_payments')
    .delete()
    .eq('id', payment_id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    })
  }

  return { success: true }
})
