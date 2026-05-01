import { serverSupabaseServiceRole } from "#supabase/server";
import { Database } from "~/types/database.types";

/**
 * Censor email to show first 2 chars + asterisks for middle + last char + domain
 * Example: prashn90@gmail.com (8 chars) -> pr*****0@gmail.com (5 censored chars)
 */
function censorEmail(email: string): string {
	if (!email || !email.includes("@")) return "";
	const [localPart, domain] = email.split("@");

	// If too short (2 or less chars), don't censor
	if (localPart.length <= 2) {
		return `${localPart}@${domain}`;
	}

	const firstTwo = localPart.substring(0, 2);
	const lastChar = localPart.charAt(localPart.length - 1);
	const censoredCount = localPart.length - 3; // total - first 2 - last 1
	const asterisks = "*".repeat(censoredCount);

	return `${firstTwo}${asterisks}${lastChar}@${domain}`;
}

/**
 * Get Google identity information for a resident
 * Returns whether Google is linked and the censored email if available
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
	const admin = client.auth.admin;

	try {
		// Get resident profile by phone
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

		if (!profile) {
			return {
				googleIdentityExists: false,
				censoredEmail: null,
			};
		}

		// Get auth user to check for Google identity
		const {
			data: { user },
			error: authError,
		} = await admin.getUserById(profile.id);

		if (authError) {
			console.error("Auth user lookup error:", authError);
			throw createError({
				statusCode: 500,
				statusMessage: "Failed to check linked Google identity",
			});
		}

		if (!user) {
			return {
				googleIdentityExists: false,
				censoredEmail: null,
			};
		}

		// Check for Google identity
		const googleIdentity = user.identities?.find(
			(identity) => identity.provider === "google"
		);
		const googleIdentityExists = !!googleIdentity;

		// Extract email from Google identity's identity_data field
		const googleEmail =
			(googleIdentity?.identity_data?.email as string | undefined) || null;
		const censoredEmail =
			googleIdentityExists && googleEmail ? censorEmail(googleEmail) : null;

		return {
			googleIdentityExists,
			censoredEmail,
		};
	} catch (error: any) {
		if (error.statusCode) {
			throw error;
		}

		console.error("Error in get-resident-google-identity API:", error);
		throw createError({
			statusCode: 500,
			statusMessage: error.message || "Internal server error",
		});
	}
});
