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
	const { resident_id, hostel_slug } = body;

	if (!resident_id || !hostel_slug) {
		throw createError({ statusCode: 400, statusMessage: "resident_id and hostel_slug are required" });
	}

	const { data: hostel, error: hostelError } = await client
		.from("hostels")
		.select("id, admin_user_id")
		.eq("hostel_slug", hostel_slug)
		.single();

	if (hostelError || !hostel) {
		throw createError({ statusCode: 404, statusMessage: "Hostel not found" });
	}

	const isAdmin = hostel.admin_user_id === user.sub;
	
	if (!isAdmin) {
		// If not admin, check if staff with manage_residents permission
		const isStaff = await isStaffForHostel(event, user.sub, hostel.id);
		if (!isStaff) {
			throw createError({ statusCode: 403, statusMessage: "Forbidden" });
		}
		
		const hasPermission = await staffHasPermission(event, user.sub, hostel.id, "manage_residents");
		if (!hasPermission) {
			throw createError({ statusCode: 403, statusMessage: "Forbidden" });
		}
	}

	const { error: deleteError } = await client
		.from("residents")
		.delete()
		.eq("id", resident_id)
		.eq("hostel_id", hostel.id);

	if (deleteError) {
		throw createError({ statusCode: 500, statusMessage: "Failed to remove resident" });
	}

	return { success: true };
});
