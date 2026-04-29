import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const { phone } = body;

	if (!phone) {
		throw createError({
			statusCode: 400,
			statusMessage: "Phone number is required",
		});
	}

	// Normalize: strip any '+' prefix so we always work with digits only
	const normalizedPhone = phone.replace("+", "");

	const client = serverSupabaseServiceRole(event);
	const admin = client.auth.admin;

	// Check if a resident profile already exists with this phone
	const {
		data: profile,
		error: profileError,
	}: {
		data: Database["public"]["Tables"]["profiles"]["Row"] | null;
		error: any;
	} = await client
		.from("profiles")
		.select("id, user_role")
		.eq("phone", normalizedPhone)
		.eq("user_role", "resident")
		.maybeSingle();

	if (profileError) {
		console.error("Profile check error:", profileError);
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to check resident status",
		});
	}

	if (profile) {
		const {
			data: { user },
			error,
		} = await admin.getUserById(profile.id);

		if (error) {
			console.error("Auth user lookup error:", error);
			throw createError({
				statusCode: 500,
				statusMessage: "Failed to check linked Google identity",
			});
		}

		const googleIdentityExists = !!user?.identities?.some((identity) => identity.provider === "google");

		const {
			data: invite,
			error: inviteError,
		}: {
			data: Database["public"]["Tables"]["resident_invites"]["Row"] | null;
			error: any;
		} = await client
			.from("resident_invites")
			.select("id")
			.eq("phone", normalizedPhone)
			.maybeSingle();

		if (inviteError) {
			console.error("Invite check error:", inviteError);
			throw createError({
				statusCode: 500,
				statusMessage: "Failed to check invitation status",
			});
		}

		return {
			exists: true,
			invited: !!invite,
			googleIdentityExists,
			canProceed: true,
		};
	}

	// Check if phone exists in resident_invites
	const {
		data: invite,
		error: inviteError,
	}: {
		data: Database["public"]["Tables"]["resident_invites"]["Row"] | null;
		error: any;
	} = await client
		.from("resident_invites")
		.select("id")
		.eq("phone", normalizedPhone)
		.maybeSingle();

	if (inviteError) {
		console.error("Invite check error:", inviteError);
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to check invitation status",
		});
	}

	return {
		exists: !!profile,
		invited: !!invite,
		googleIdentityExists: false,
		canProceed: !!profile || !!invite,
	};
});
