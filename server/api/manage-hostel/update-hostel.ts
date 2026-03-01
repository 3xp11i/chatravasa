import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = await getAuthUser(event);
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    const client = await getAuthenticatedClient(event);
    const query = getQuery(event);
    const hostelSlug = query.slug as string;

    if (!hostelSlug || typeof hostelSlug !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'Valid Hostel Slug is required' });
    }

    // Check if hostel belongs to the current user
    const { data: hostel, error: fetchError } = await client
      .from('hostels')
      .select('*')
      .eq('hostel_slug', hostelSlug)
      .eq('admin_user_id', user.sub)
      .single();

    if (fetchError || !hostel) {
      throw createError({ statusCode: 404, statusMessage: 'Hostel not found' });
    }

    // Get multipart form data
    const form = await readMultipartFormData(event);
    
    const updateData: any = {};

    if (form) {
      for (const field of form) {
        if (field.name === 'hostelName') {
          updateData.hostel_name = field.data.toString();
        } else if (field.name === 'address') {
          updateData.address = field.data.toString();
        } else if (field.name === 'totalRooms') {
          const newRooms = parseInt(field.data.toString());
          updateData.total_rooms = newRooms;
          // Update available rooms if it exceeds new total
          if (hostel.available_rooms != null && hostel.available_rooms > newRooms) {
            updateData.available_rooms = newRooms;
          }
        } else if (field.name === 'availableRooms') {
          const availRooms = parseInt(field.data.toString());
          if (!isNaN(availRooms)) {
            updateData.available_rooms = availRooms;
          }
        }
      }
    }

    // Validate input
    if (Object.keys(updateData).length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No data to update' });
    }

    // Update hostel
    const { data: updatedHostel, error: updateError } = await client
      .from('hostels')
      .update(updateData)
      .eq('hostel_slug', hostelSlug)
      .select()
      .single();

    if (updateError) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to update hostel' });
    }

    return { success: true, hostel: updatedHostel };
  } catch (error: any) {
    console.error('Error updating hostel:', error);
    throw error;
  }
});