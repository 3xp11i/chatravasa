import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";
import { isStaffForHostel, staffHasPermission } from "#imports";

export default defineEventHandler(async (event) => {
	const user = await serverSupabaseUser(event);
	if (!user) {
		throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
	}

	const client = await serverSupabaseClient<Database>(event);
	const query = getQuery(event);
	const { hostel_slug, limit, offset, filter } = query;

	if (!hostel_slug || typeof hostel_slug !== "string") {
		throw createError({ statusCode: 400, statusMessage: "hostel_slug is required" });
	}

	const pageLimit = limit ? parseInt(limit as string) : 10;
	const pageOffset = offset ? parseInt(offset as string) : 0;
	const currentMonth = new Date().getMonth(); // 0-based, 11 for December

	// RLS policies handle access - staff can view hostels they're assigned to
	const { data: hostel, error: hostelError } = await client
		.from("hostels")
		.select("id, admin_user_id")
		.eq("hostel_slug", hostel_slug)
		.single();

	if (hostelError || !hostel) {
		throw createError({ statusCode: 404, statusMessage: "Hostel not found" });
	}

	// Check if user is admin or staff with view_fees permission
	const isAdmin = hostel.admin_user_id === user.sub;
	
	if (!isAdmin) {
		// If not admin, check if staff with view_fees permission
		const isStaff = await isStaffForHostel(event, user.sub, hostel.id);
		if (!isStaff) {
			throw createError({ statusCode: 403, statusMessage: "Forbidden" });
		}
		
		const hasViewPermission = await staffHasPermission(event, user.sub, hostel.id, "view_fees");
		if (!hasViewPermission) {
			throw createError({ statusCode: 403, statusMessage: "You do not have permission to view fees" });
		}
	}

	// Fetch residents with fees
	const { data: residentsWithFees, error: residentsError } = await client
		.from("residents")
		.select(`
			id,
			room,
			joining_date,
			guardian_name,
			family_phone_number,
			created_at,
			profiles!inner(first_name, last_name, phone, avatar),
			hostel_residents_fees(monthly_fees)
		`)
		.eq("hostel_id", hostel.id);

	if (residentsError) {
		throw createError({ statusCode: 500, statusMessage: "Failed to load residents" });
	}

	// Transform residents and determine payment status
	let transformedResidents = (residentsWithFees || []).map(r => {
		const monthlyFees = r.hostel_residents_fees?.monthly_fees || [];
		const hasPaid = monthlyFees.includes(currentMonth); // Check if current month is in the array

		return {
			id: r.id,
			first_name: r.profiles.first_name,
			last_name: r.profiles.last_name,
			phone_number: r.profiles.phone,
			avatar: r.profiles.avatar,
			room: r.room,
			joining_date: r.joining_date,
			father_name: r.guardian_name,
			family_phone_number: r.family_phone_number,
			created_at: r.created_at,
			has_paid_current_month: hasPaid,
		};
	});

	// Apply filter
	if (filter === 'paid') {
		transformedResidents = transformedResidents.filter(r => r.has_paid_current_month);
	} else if (filter === 'not_paid') {
		transformedResidents = transformedResidents.filter(r => !r.has_paid_current_month);
	}

	// Sort by created_at (descending)
	transformedResidents.sort(
		(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);

	const total = transformedResidents.length;
	const paginated = transformedResidents.slice(pageOffset, pageOffset + pageLimit);

	return {
		residents: paginated,
		total,
		limit: pageLimit,
		offset: pageOffset,
	};
});