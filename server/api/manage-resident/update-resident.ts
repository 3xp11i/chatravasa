import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
	const user = await serverSupabaseUser(event);
	if (!user) {
		throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
	}

	const client = await serverSupabaseClient<Database>(event);
	const body = await readBody(event);

	const {
		resident_id,
		hostel_slug,
		first_name,
		last_name,
		phone_number,
		joining_date,
		father_name,
		family_phone_number,
		room,
		avatar,
	} = body;

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

	if (hostel.admin_user_id !== user.sub) {
		throw createError({ statusCode: 403, statusMessage: "Forbidden" });
	}

	// Validate phone number if provided
	if (phone_number && !/^\d{10}$/.test(phone_number)) {
		throw createError({ statusCode: 400, statusMessage: "Phone number must be 10 digits" });
	}

	const updatePayload: Database["public"]["Tables"]["residents"]["Update"] = {};
	if (first_name !== undefined) updatePayload.first_name = first_name;
	if (last_name !== undefined) updatePayload.last_name = last_name;
	if (phone_number !== undefined) updatePayload.phone_number = phone_number;
	if (joining_date !== undefined) updatePayload.joining_date = joining_date || null;
	if (father_name !== undefined) updatePayload.father_name = father_name || null;
	if (family_phone_number !== undefined) updatePayload.family_phone_number = family_phone_number || null;
	if (room !== undefined) updatePayload.room = room;
	if (avatar !== undefined) updatePayload.avatar = avatar || null;

	const { data: updated, error: updateError } = await client
		.from("residents")
		.update(updatePayload)
		.eq("id", resident_id)
		.eq("hostel_id", hostel.id)
		.select()
		.single();

	if (updateError) {
		throw createError({ statusCode: 500, statusMessage: "Failed to update resident" });
	}

	return { success: true, data: updated };
});
