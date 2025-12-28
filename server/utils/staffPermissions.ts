import { serverSupabaseClient } from "#supabase/server";
import type { Database } from "~/types/database.types";

export interface StaffRole {
  id: string;
  title: string;
  hostel_id: string;
  view_residents: boolean;
  manage_residents: boolean;
  view_meals: boolean;
  manage_meals: boolean;
  view_fees: boolean;
  manage_fees: boolean;
  view_complaints: boolean;
  manage_complaints: boolean;
}

/**
 * Get staff member's role for a specific hostel
 */
export async function getStaffRoleForHostel(
  event: any,
  userId: string,
  hostelId: string
): Promise<StaffRole | null> {
  const client = await serverSupabaseClient<Database>(event);

  const { data, error } = await client
    .from("hostel_staff")
    .select(`
      hostel_staff_roles (
        id,
        title,
        hostel_id,
        view_residents,
        manage_residents,
        view_meals,
        manage_meals,
        view_fees,
        manage_fees,
        view_complaints,
        manage_complaints
      )
    `)
    .eq("staff_member_id", userId)
    .single();

  if (error || !data) return null;

  const role = (data as any).hostel_staff_roles;
  if (!role || role.hostel_id !== hostelId) return null;

  return role as StaffRole;
}

/**
 * Check if staff member has a specific permission for a hostel
 */
export async function staffHasPermission(
  event: any,
  userId: string,
  hostelId: string,
  permission: keyof Omit<StaffRole, "id" | "title" | "hostel_id">
): Promise<boolean> {
  const role = await getStaffRoleForHostel(event, userId, hostelId);
  if (!role) return false;
  return role[permission] ?? false;
}

/**
 * Check if user is staff member for a hostel (not admin)
 * Returns true if user is staff, false if admin or not staff
 */
export async function isStaffForHostel(
  event: any,
  userId: string,
  hostelId: string
): Promise<boolean> {
  const client = await serverSupabaseClient<Database>(event);

  // Check if user is admin of this hostel
  const { data: hostel } = await client
    .from("hostels")
    .select("admin_user_id")
    .eq("id", hostelId)
    .single();

  if (hostel?.admin_user_id === userId) return false; // User is admin, not staff

  // Check if user is staff for this hostel
  const role = await getStaffRoleForHostel(event, userId, hostelId);
  return role !== null;
}

/**
 * Verify staff member can access hostel resource with a specific permission
 * Throws error if not authorized
 */
export async function verifyStaffPermission(
  event: any,
  userId: string,
  hostelId: string,
  permission: keyof Omit<StaffRole, "id" | "title" | "hostel_id">
) {
  const hasPermission = await staffHasPermission(event, userId, hostelId, permission);

  if (!hasPermission) {
    throw createError({
      statusCode: 403,
      statusMessage: `You do not have permission to ${permission}`,
    });
  }
}
