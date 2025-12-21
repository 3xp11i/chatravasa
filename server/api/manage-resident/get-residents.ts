import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
	const user = await serverSupabaseUser(event);
	if (!user) {
		throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
	}

	const client = await serverSupabaseClient<Database>(event);
	const query = getQuery(event);
	const { hostel_slug, limit, offset } = query;

	if (!hostel_slug || typeof hostel_slug !== "string") {
		throw createError({ statusCode: 400, statusMessage: "hostel_slug is required" });
	}

	const pageLimit = limit ? parseInt(limit as string) : 10;
	const pageOffset = offset ? parseInt(offset as string) : 0;

	const { data: hostel, error: hostelError } = await client
		.from("hostels")
		.select("id, admin_user_id")
		.eq("hostel_slug", hostel_slug)
		.single();

	if (hostelError || !hostel) {
		throw createError({ statusCode: 404, statusMessage: "Hostel not found" });
	}

	if (hostel.admin_user_id !== user.sub) {
		throw createError({ statusCode: 403, statusMessage: "Forbidden" });
	}

	// Get total count
	const { count, error: countError } = await client
		.from("residents")
		.select("*", { count: "exact", head: true })
		.eq("hostel_id", hostel.id);

	if (countError) {
		throw createError({ statusCode: 500, statusMessage: "Failed to count residents" });
	}

	// Get paginated residents
	const { data: residents, error: residentsError } = await client
		.from("residents")
		.select(`
			id,
			room,
			joining_date,
			guardian_name,
			family_phone_number,
			created_at,
			profiles!inner(first_name, last_name, phone, avatar)
		`)
		.eq("hostel_id", hostel.id)
		.order("created_at", { ascending: false })
		.range(pageOffset, pageOffset + pageLimit - 1);

	if (residentsError) {
		throw createError({ statusCode: 500, statusMessage: "Failed to load residents" });
	}

	return {
		residents: residents?.map(r => ({
			id: r.id,
			first_name: r.profiles.first_name,
			last_name: r.profiles.last_name,
			phone_number: r.profiles.phone,
			avatar: r.profiles.avatar,
			room: r.room,
			joining_date: r.joining_date,
			father_name: r.guardian_name,
			family_phone_number: r.family_phone_number,
		})) || [],
		total: count || 0,
		limit: pageLimit,
		offset: pageOffset,
	};
});
