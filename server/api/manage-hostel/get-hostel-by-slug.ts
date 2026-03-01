// get-hostel-by-slug

import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'

export default defineEventHandler(async (event) => {
	try {
		const user = await getAuthUser(event);
		if (!user) {
			throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
		}
		
		const query = getQuery(event);
		const hostelSlug = query.slug as string;
		if (!hostelSlug || typeof hostelSlug !== "string") {
			throw createError({
				statusCode: 400,
				statusMessage: "Valid Hostel Slug is required",
			});
		}
		
		const client = await getAuthenticatedClient(event);
		
		// RLS policies handle access:
		// - Admins can view their own hostels
		// - Staff can view hostels they're assigned to (via is_staff_of_hostel function)
		const { data: hostel, error: hostelError } = await client
			.from("hostels")
			.select("*")
			.eq("hostel_slug", hostelSlug)
			.single();
		
		if (hostelError || !hostel) {
			throw createError({ statusCode: 404, statusMessage: "Hostel not found" });
		}
		
		return { success: true, hostel };
	} catch (error: any) {
		console.error("Error fetching hostel by slug:", error);
		throw error;
	}
});
