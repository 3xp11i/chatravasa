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
		monthly_fee_amount,
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

	// Update profiles table (first_name, last_name, phone, avatar)
	const profilePayload: Database["public"]["Tables"]["profiles"]["Update"] = {};
	if (first_name !== undefined) profilePayload.first_name = first_name;
	if (last_name !== undefined) profilePayload.last_name = last_name;
	if (phone_number !== undefined) profilePayload.phone = phone_number;
	if (avatar !== undefined) profilePayload.avatar = avatar || null;

	// Only update profiles if there are fields to update
	if (Object.keys(profilePayload).length > 0) {
		const { error: profileError } = await client
			.from("profiles")
			.update(profilePayload)
			.eq("id", resident_id);

		if (profileError) {
			console.error("Profile update error:", profileError);
			throw createError({ statusCode: 500, statusMessage: "Failed to update profile information" });
		}
	}

	// Update residents table (room, joining_date, guardian_name, family_phone_number, monthly_fee_amount)
	const residentPayload: Database["public"]["Tables"]["residents"]["Update"] = {};
	if (joining_date !== undefined) residentPayload.joining_date = joining_date || null;
	if (father_name !== undefined) residentPayload.guardian_name = father_name || null; // Map father_name to guardian_name
	if (family_phone_number !== undefined) residentPayload.family_phone_number = family_phone_number || null;
	if (room !== undefined) residentPayload.room = room;
	if (monthly_fee_amount !== undefined) residentPayload.monthly_fee_amount = monthly_fee_amount || null;

	// Only update residents if there are fields to update
	if (Object.keys(residentPayload).length > 0) {
		const { data: updated, error: updateError } = await client
			.from("residents")
			.update(residentPayload)
			.eq("id", resident_id)
			.eq("hostel_id", hostel.id)
			.select()
			.single();

		if (updateError) {
			console.error("Resident update error:", updateError);
			throw createError({ statusCode: 500, statusMessage: "Failed to update resident information" });
		}

		return { success: true, data: updated };
	}

	return { success: true };
});
