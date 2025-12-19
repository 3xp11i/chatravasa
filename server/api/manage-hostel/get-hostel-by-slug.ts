// get-hostel-by-slug

import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event) => {
	try {
		const user = await serverSupabaseUser(event);
		if (!user) {
			throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
		}
		const client = await serverSupabaseClient(event);
		const query = getQuery(event);
		const hostelSlug = query.slug as string;
		if (!hostelSlug || typeof hostelSlug !== "string") {
			throw createError({
				statusCode: 400,
				statusMessage: "Valid Hostel Slug is required",
			});
		}
		// Use 'sub' which is the user ID in the JWT
		const userId = user.sub;
		// Fetch hostel by slug for the current admin user
		const { data: hostel, error } = await client

			.from("hostels")
			.select("*")
			.eq("hostel_slug", hostelSlug)
			.eq("admin_user_id", userId)
			.single();

            console.log(hostel);
            
		if (error || !hostel) {
			throw createError({ statusCode: 404, statusMessage: "Hostel not found" });
		}
		return { success: true, hostel };
	} catch (error: any) {
		console.error("Error fetching hostel by slug:", error);
		throw error;
	}
});
