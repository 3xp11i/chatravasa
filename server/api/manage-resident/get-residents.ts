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
	const { hostel_slug, limit, offset, sort_by, filter_by, search } = query;

	if (!hostel_slug || typeof hostel_slug !== "string") {
		throw createError({ statusCode: 400, statusMessage: "hostel_slug is required" });
	}

	const pageLimit = limit ? parseInt(limit as string) : 10;
	const pageOffset = offset ? parseInt(offset as string) : 0;
	const sortBy = sort_by as string || 'default'; // 'default', 'timestamp', 'name'
	const filterBy = filter_by as string || 'all'; // 'all', 'current', 'invited'
	const searchTerm = (search as string || '').trim().toLowerCase();

	// RLS policies handle access - staff can view hostels they're assigned to
	const { data: hostel, error: hostelError } = await client
		.from("hostels")
		.select("id, admin_user_id")
		.eq("hostel_slug", hostel_slug)
		.single();

	if (hostelError || !hostel) {
		throw createError({ statusCode: 404, statusMessage: "Hostel not found" });
	}

	// Check if user is admin or staff with view_residents permission
	const isAdmin = hostel.admin_user_id === user.sub;
	
	if (!isAdmin) {
		// If not admin, check if staff with view_residents permission
		const isStaff = await isStaffForHostel(event, user.sub, hostel.id);
		if (!isStaff) {
			throw createError({ statusCode: 403, statusMessage: "Forbidden" });
		}
		
		const hasViewPermission = await staffHasPermission(event, user.sub, hostel.id, "view_residents");
		if (!hasViewPermission) {
			throw createError({ statusCode: 403, statusMessage: "You do not have permission to view residents" });
		}
	}

	// RLS policies handle access - staff with view_residents can see residents
	const { data: residents, error: residentsError } = await client
		.from("residents")
		.select(`
			id,
			room,
			joining_date,
			guardian_name,
			family_phone_number,
			created_at,
			profiles!inner(first_name, last_name, phone, avatar),
			hostel_resident_fee_info(fee_category_id, discount_amount, hostel_fee_categories(amount))
		`)
		.eq("hostel_id", hostel.id);

	if (residentsError) {
		throw createError({ statusCode: 500, statusMessage: "Failed to load residents" });
	}

	// RLS policies handle access - staff with manage_residents can see invites
	const { data: invites, error: invitesError } = await client
		.from("resident_invites")
		.select("id, first_name, last_name, phone, room, joining_date, guardian_name, family_phone_number, monthly_fee_amount, created_at")
		.eq("hostel_id", hostel.id);

	if (invitesError) {
		throw createError({ statusCode: 500, statusMessage: "Failed to load resident invites" });
	}

	// Transform residents
	const transformedResidents = (residents || []).map((r: any) => {
		// Extract monthly_fee_amount from the fee info relationship
		let monthlyFeeAmount: string | null = null;
		if (r.hostel_resident_fee_info && r.hostel_resident_fee_info.length > 0) {
			const feeInfo = r.hostel_resident_fee_info[0];
			if (feeInfo.hostel_fee_categories && feeInfo.hostel_fee_categories.amount) {
				monthlyFeeAmount = feeInfo.hostel_fee_categories.amount;
			}
		}
		
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
			monthly_fee_amount: monthlyFeeAmount,
			created_at: r.created_at,
			is_invite: false,
		};
	});

	// Transform resident invites
	const transformedInvites = (invites || []).map(i => ({
		id: String(i.id), // Convert numeric ID to string for consistency
		first_name: i.first_name,
		last_name: i.last_name,
		phone_number: i.phone,
		avatar: null,
		room: i.room,
		joining_date: i.joining_date,
		father_name: i.guardian_name,
		family_phone_number: i.family_phone_number,
		monthly_fee_amount: i.monthly_fee_amount,
		created_at: i.created_at,
		is_invite: true,
	}));

	// Combine data
	let combinedData = [...transformedResidents, ...transformedInvites];
	
	// Apply filtering
	if (filterBy === 'current') {
		combinedData = combinedData.filter(r => !r.is_invite);
	} else if (filterBy === 'invited') {
		combinedData = combinedData.filter(r => r.is_invite);
	}
	
	// Apply search filtering
	if (searchTerm) {
		combinedData = combinedData.filter(r => {
			const fullName = `${r.first_name} ${r.last_name}`.toLowerCase();
			const phone = (r.phone_number || '').replace(/[^\d]/g, '').slice(-10);
			const room = (r.room || '').toLowerCase();
			return fullName.includes(searchTerm) || phone.includes(searchTerm) || room.includes(searchTerm);
		});
	}
	
	// Apply sorting
	if (sortBy === 'timestamp') {
		// Sort by created_at timestamp (newest first)
		combinedData.sort(
			(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		);
	} else if (sortBy === 'name') {
		// Sort alphabetically by first name, then last name
		combinedData.sort((a, b) => {
			const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
			const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
			return nameA.localeCompare(nameB);
		});
	} else {
		// Default: Show actual residents first, then invited residents, sorted by timestamp within each group
		combinedData.sort((a, b) => {
			// First, sort by is_invite (false comes first)
			if (a.is_invite !== b.is_invite) {
				return a.is_invite ? 1 : -1;
			}
			// Then sort by timestamp (newest first)
			return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
		});
	}

	const total = combinedData.length;
	const paginated = combinedData.slice(pageOffset, pageOffset + pageLimit);

	return {
		residents: paginated,
		total,
		limit: pageLimit,
		offset: pageOffset,
	};
});
