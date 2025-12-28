import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";
import { isStaffForHostel, staffHasPermission } from "#imports";

export default defineEventHandler(async (event) => {
	const user = await serverSupabaseUser(event);
	if (!user) {
		throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
	}

	const client = await serverSupabaseClient<Database>(event);
	const body = await readBody(event);
	const { resident_id, hostel_slug, month, paid } = body;

	if (!resident_id || !hostel_slug || typeof month !== 'number' || typeof paid !== 'boolean') {
		throw createError({ statusCode: 400, statusMessage: "Invalid request data" });
	}

	// RLS policies handle access - staff can view hostels they're assigned to
	const { data: hostel, error: hostelError } = await client
		.from("hostels")
		.select("id, admin_user_id")
		.eq("hostel_slug", hostel_slug)
		.single();

	if (hostelError || !hostel) {
		throw createError({ statusCode: 404, statusMessage: "Hostel not found" });
	}

	// Check if user is admin or staff with manage_fees permission
	const isAdmin = hostel.admin_user_id === user.sub;
	
	if (!isAdmin) {
		// If not admin, check if staff with manage_fees permission
		const isStaff = await isStaffForHostel(event, user.sub, hostel.id);
		if (!isStaff) {
			throw createError({ statusCode: 403, statusMessage: "Forbidden" });
		}
		
		const hasManagePermission = await staffHasPermission(event, user.sub, hostel.id, "manage_fees");
		if (!hasManagePermission) {
			throw createError({ statusCode: 403, statusMessage: "You do not have permission to manage fees" });
		}
	}

	// Get current monthly_fees
	const { data: feeRecord, error: feeError } = await client
		.from("hostel_residents_fees")
		.select("monthly_fees")
		.eq("resident_id", resident_id)
		.eq("hostel_id", hostel.id)
		.single();

	if (feeError && feeError.code !== 'PGRST116') { // PGRST116 is "not found"
		throw createError({ statusCode: 500, statusMessage: "Failed to fetch fee record" });
	}

	let currentFees = feeRecord?.monthly_fees || [];

	if (paid) {
		// Add month if not already present
		if (!currentFees.includes(month)) {
			currentFees.push(month);
			currentFees.sort((a, b) => a - b); // Keep sorted
		}
	} else {
		// Remove month if present
		currentFees = currentFees.filter(m => m !== month);
	}

	// Update or insert the record
	const { error: updateError } = await client
		.from("hostel_residents_fees")
		.upsert({
			resident_id,
			hostel_id: hostel.id,
			monthly_fees: currentFees,
			updated_at: new Date().toISOString()
		}, {
			onConflict: 'resident_id,hostel_id'
		});

	if (updateError) {
		throw createError({ statusCode: 500, statusMessage: "Failed to update fee status" });
	}

	return { success: true };
});