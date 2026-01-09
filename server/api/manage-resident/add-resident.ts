import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { Database } from "~/types/database.types";
import { isStaffForHostel, staffHasPermission } from "#imports";

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
		const { first_name, last_name, phone, room, joining_date, guardian_name, family_phone_number, monthly_fee_amount, hostel_slug } = body;

		// Validate required fields
		if (!first_name || !last_name || !phone || !room || !hostel_slug) {
			throw createError({
				statusCode: 400,
				statusMessage: "Missing required fields: first_name, last_name, phone, room, hostel_slug",
			});
		}

		// Validate phone number format - should be +91 followed by 10 digits
		const isValidPhone = /^\+91\d{10}$/.test(phone);
		if (!isValidPhone) {
			throw createError({
				statusCode: 400,
				statusMessage: "Invalid phone number format. Expected format: +91xxxxxxxxxx",
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

		// Verify the current user is either the admin or staff with manage_residents permission
		const isAdmin = hostel.admin_user_id === userId;
		
		if (!isAdmin) {
			// If not admin, check if staff with manage_residents permission
			const isStaff = await isStaffForHostel(event, userId, hostel.id);
			if (!isStaff) {
				throw createError({
					statusCode: 403,
					statusMessage: "You are not authorized to add residents to this hostel",
				});
			}
			
			const hasPermission = await staffHasPermission(event, userId, hostel.id, "manage_residents");
			if (!hasPermission) {
				throw createError({
					statusCode: 403,
					statusMessage: "You are not authorized to add residents to this hostel",
				});
			}
		}

		// Phone is already normalized to +91 format from frontend
		const normalizedPhone = phone;

		// Check if this phone already exists in resident_invites for this hostel
		const { data: existingInvite } = await client
			.from("resident_invites")
			.select("id")
			.eq("phone", normalizedPhone)
			.eq("hostel_id", hostel.id)
			.single();

		if (existingInvite) {
			throw createError({
				statusCode: 409,
				statusMessage: "This resident has already been added to this hostel",
			});
		}

		// Check if resident already exists (already logged in)
		const { data: existingResident } = await client
			.from("residents")
			.select("id, hostel_id")
			.eq("hostel_id", hostel.id)
			.then(async (result) => {
				if (result.error) return { data: null, error: result.error };
				
				// For each resident, check if their phone matches in profiles
				for (const resident of result.data || []) {
					const { data: profile } = await client
						.from("profiles")
						.select("phone")
						.eq("id", resident.id)
						.single();
					
					if (profile?.phone === normalizedPhone) {
						return { data: resident, error: null };
					}
				}
				return { data: null, error: null };
			});

		if (existingResident) {
			throw createError({
				statusCode: 409,
				statusMessage: "A resident with this phone number already exists in this hostel",
			});
		}

		// Insert into resident_invites table
		const { data: newInvite, error: insertError } = await client
			.from("resident_invites")
			.insert({
				first_name,
				last_name,
				phone: normalizedPhone,
				room,
				hostel_id: hostel.id,
				joining_date: joining_date || null,
				guardian_name: guardian_name || null,
				family_phone_number: family_phone_number || null,
				monthly_fee_amount: monthly_fee_amount || null,
			})
			.select()
			.single();

		if (insertError) {
			console.error("Error inserting resident invite:", insertError);
			throw createError({
				statusCode: 500,
				statusMessage: "Failed to add resident",
			});
		}

		return {
			success: true,
			message: "Resident added successfully",
			data: newInvite,
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
