import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
	try {
		const user = await serverSupabaseUser(event);
		if (!user) {
			throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
		}

		const client = await serverSupabaseClient<Database>(event);
		const userId = user.sub;

		// Parse the request body
		const body = await readBody(event);
		const { first_name, last_name, phone_number, joining_date, hostel_slug, family_phone_number, father_name, room } = body;

		// Validate required fields
		if (!first_name || !last_name || !phone_number || !hostel_slug) {
			throw createError({
				statusCode: 400,
				statusMessage: "Missing required fields: first_name, last_name, phone_number, hostel_slug",
			});
		}

		// Validate phone number format (10 digits)
		if (!/^\d{10}$/.test(phone_number)) {
			throw createError({
				statusCode: 400,
				statusMessage: "Phone number must be 10 digits",
			});
		}

		// Get the hostel by slug and verify the admin owns it
		const { data: hostel, error: hostelError } = await client
			.from("hostels")
			.select("id, admin_user_id")
			.eq("hostel_slug", hostel_slug)
			.single();

		if (hostelError || !hostel) {
			throw createError({
				statusCode: 404,
				statusMessage: "Hostel not found",
			});
		}

		// Verify the current user is the admin of this hostel
		if (hostel.admin_user_id !== userId) {
			throw createError({
				statusCode: 403,
				statusMessage: "You are not authorized to add residents to this hostel",
			});
		}

		// Check if phone number already exists in this hostel
		const { data: existingResident } = await client
			.from("residents")
			.select("id")
			.eq("phone_number", phone_number)
			.eq("hostel_id", hostel.id)
			.single();

		if (existingResident) {
			throw createError({
				statusCode: 409,
				statusMessage: "A resident with this phone number already exists in this hostel",
			});
		}

		// Create a user account for the resident
		// Note: You'll need to adjust this based on your authentication setup
		// For now, we'll generate a unique ID for the resident
		const residentId = crypto.randomUUID();

		// Insert the new resident
		const { data: newResident, error: insertError } = await client
			.from("residents")
			.insert({
				id: residentId,
				first_name,
				last_name,
				phone_number,
				hostel_id: hostel.id,
				joining_date: joining_date || null,
				family_phone_number: family_phone_number || null,
				father_name: father_name || null,
				room: room || "Not Assigned",
			})
			.select()
			.single();

		if (insertError) {
			console.error("Error inserting resident:", insertError);
			throw createError({
				statusCode: 500,
				statusMessage: "Failed to add resident",
			});
		}

		return {
			success: true,
			message: "Resident added successfully",
			data: newResident,
		};
	} catch (error: any) {
		console.error("Error in add-resident API:", error);
		
		// If it's already a createError, re-throw it
		if (error.statusCode) {
			throw error;
		}

		// Otherwise, throw a generic error
		throw createError({
			statusCode: 500,
			statusMessage: error.message || "Internal server error",
		});
	}
});
