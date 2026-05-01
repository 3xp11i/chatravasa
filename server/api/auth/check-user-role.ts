import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~/types/database.types";

/**
 * Unified user role checker endpoint
 * Determines user role (admin, staff, resident) and eligibility for login
 * Checks profiles table first, then invite tables for staff and residents
 */
export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const { phone } = body;

	if (!phone) {
		throw createError({
			statusCode: 400,
			statusMessage: "Phone number is required",
		});
	}

	// Normalize: strip '+' prefix to work with digits only
	const normalizedPhone = phone.replace("+", "");

	const client = serverSupabaseServiceRole(event);

	try {
		// Check profiles table for existing user (any role)
		const {
			data: profile,
			error: profileError,
		}: {
			data: (Database["public"]["Tables"]["profiles"]["Row"] & {
				user_role: "admin" | "staff_member" | "resident";
			}) | null;
			error: any;
		} = await client
			.from("profiles")
			.select("id, user_role")
			.eq("phone", normalizedPhone)
			.maybeSingle();

		if (profileError) {
			console.error("Profile check error:", profileError);
			throw createError({
				statusCode: 500,
				statusMessage: "Failed to check user status",
			});
		}

		// User exists in profiles
		if (profile) {
			return {
				role: profile.user_role,
				exists: true,
				invited: false,
				canProceed: true,
				profileId: profile.id,
			};
		}

		// User not in profiles, check invite tables for staff and residents

		// Check hostel_staff_invites
		const {
			data: staffInvite,
			error: staffInviteError,
		}: {
			data: Database["public"]["Tables"]["hostel_staff_invites"]["Row"] | null;
			error: any;
		} = await client
			.from("hostel_staff_invites")
			.select("id")
			.eq("phone", normalizedPhone)
			.maybeSingle();

		if (staffInviteError) {
			console.error("Staff invite check error:", staffInviteError);
			throw createError({
				statusCode: 500,
				statusMessage: "Failed to check staff invitation status",
			});
		}

		if (staffInvite) {
			return {
				role: "staff_member",
				exists: false,
				invited: true,
				canProceed: true,
			};
		}

		// Check resident_invites
		const {
			data: residentInvite,
			error: residentInviteError,
		}: {
			data: Database["public"]["Tables"]["resident_invites"]["Row"] | null;
			error: any;
		} = await client
			.from("resident_invites")
			.select("id")
			.eq("phone", normalizedPhone)
			.maybeSingle();

		if (residentInviteError) {
			console.error("Resident invite check error:", residentInviteError);
			throw createError({
				statusCode: 500,
				statusMessage: "Failed to check resident invitation status",
			});
		}

		if (residentInvite) {
			return {
				role: "resident",
				exists: false,
				invited: true,
				canProceed: true,
			};
		}

		// User has no role and no invitation
		return {
			role: null,
			exists: false,
			invited: false,
			canProceed: false,
		};
	} catch (error: any) {
		if (error.statusCode) {
			throw error;
		}

		console.error("Error in check-user-role API:", error);
		throw createError({
			statusCode: 500,
			statusMessage: error.message || "Internal server error",
		});
	}
});
