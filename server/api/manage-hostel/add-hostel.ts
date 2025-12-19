import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

// Generate slug from hostel name
function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

export default defineEventHandler(async (event) => {
	try {
		const user = await serverSupabaseUser(event);
		if (!user) {
			throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
		}
		const client = await serverSupabaseClient(event);

		// Use 'sub' which is the user ID in the JWT
		const userId = user.sub;

		// Get multipart form data
		const form = await readMultipartFormData(event);
		if (!form) {
			throw createError({
				statusCode: 400,
				statusMessage: "No form data provided",
			});
		}

		// Extract form fields
		let hostelName = "";
		let hostelLocation = "";
		let numberOfRooms = 0;
		let availableRooms: number | null = null;
		let hostelPhotoFile: any = null;

		for (const field of form) {
			if (field.name === "hostelName") {
				hostelName = field.data.toString();
			} else if (field.name === "hostelLocation") {
				hostelLocation = field.data.toString();
			} else if (field.name === "numberOfRooms") {
				numberOfRooms = parseInt(field.data.toString());
			} else if (field.name === "availableRooms") {
				availableRooms = parseInt(field.data.toString());
			} else if (field.name === "hostelPhoto") {
				hostelPhotoFile = field;
			}
		}

		// Validate inputs
		if (!hostelName?.trim() || !hostelLocation?.trim() || numberOfRooms <= 0) {
			throw createError({
				statusCode: 400,
				statusMessage: "Invalid input data",
			});
		}

		// Generate slug
		let slug = generateSlug(hostelName);

		// Check if slug already exists and make it unique
		let slugExists = true;
		let counter = 1;
		const originalSlug = slug;

		while (slugExists) {
			const { data: existingHostel } = await client
				.from("hostels")
				.select("id")
				.eq("hostel_slug", slug)
				.single();

			if (!existingHostel) {
				slugExists = false;
			} else {
				slug = `${originalSlug}-${counter}`;
				counter++;
			}
		}

		// Upload photo to storage if provided
		let photoUrl = null;
		if (hostelPhotoFile) {
			const fileName = `${slug}-${Date.now()}.${getFileExtension(
				hostelPhotoFile.filename
			)}`;
			const { data: uploadData, error: uploadError } = await client.storage
				.from("hostel-photos")
				.upload(`hostels/${fileName}`, hostelPhotoFile.data);

			if (uploadError) {
				throw createError({
					statusCode: 500,
					statusMessage: "Failed to upload photo",
				});
			}

			// Get public URL
			const { data: publicUrl } = client.storage
				.from("hostel-photos")
				.getPublicUrl(`hostels/${fileName}`);

			photoUrl = publicUrl.publicUrl;
		}

		// Insert hostel into database
		const { data: newHostel, error } = await client
			.from("hostels")
			.insert({
				hostel_name: hostelName,
				address: hostelLocation,
				admin_user_id: userId,
				total_rooms: numberOfRooms,
				available_rooms:
					availableRooms !== null ? availableRooms : numberOfRooms,
				hostel_slug: slug,
			})
			.select()
			.single();

		if (error) {
			console.error("Database error:", error);
			throw createError({
				statusCode: 500,
				statusMessage: `Failed to add hostel: ${error.message}`,
			});
		}

		return { success: true, hostel: newHostel };
	} catch (error: any) {
		console.error("Error adding hostel:", error);
		throw error;
	}
});

function getFileExtension(filename: string): string {
	return filename.split(".").pop() || "jpg";
}
