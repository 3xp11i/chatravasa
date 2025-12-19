import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

function getFileExtension(filename: string): string {
  return filename.split('.').pop() || 'jpg';
}

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event);
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    const client = await serverSupabaseClient(event);
    const query = getQuery(event);
    const hostelId = parseInt(query.id as string);

    if (!hostelId || isNaN(hostelId)) {
      throw createError({ statusCode: 400, statusMessage: 'Valid Hostel ID is required' });
    }

    // Check if hostel belongs to the current user
    const { data: hostel, error: fetchError } = await client
      .from('hostels')
      .select('*')
      .eq('id', hostelId)
      .eq('admin_user_id', user.id)
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
        } else if (field.name === 'hostelLocation') {
          updateData.address = field.data.toString();
        } else if (field.name === 'numberOfRooms') {
          const newRooms = parseInt(field.data.toString());
          updateData.total_rooms = newRooms;
          // Update available rooms if it exceeds new total
          if (hostel.available_rooms != null && hostel.available_rooms > newRooms) {
            updateData.available_rooms = newRooms;
          }
        } else if (field.name === 'hostelPhoto') {
          // Handle photo upload
          const fileName = `${hostel.hostel_slug}-${Date.now()}.${getFileExtension(field.filename || 'jpg')}`;
          const { data: uploadData, error: uploadError } = await client.storage
            .from('hostel-photos')
            .upload(`hostels/${fileName}`, field.data);

          if (uploadError) {
            console.error('Photo upload error:', uploadError);
          } else {
            const { data: publicUrl } = client.storage
              .from('hostel-photos')
              .getPublicUrl(`hostels/${fileName}`);
            updateData.photo_url = publicUrl.publicUrl;
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
      .eq('id', hostelId)
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