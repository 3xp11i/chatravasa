import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

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

    // Delete hostel from database
    const { error: deleteError } = await client
      .from('hostels')
      .delete()
      .eq('id', hostelId);

    if (deleteError) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to delete hostel' });
    }

    return { success: true, message: 'Hostel deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting hostel:', error);
    throw error;
  }
});