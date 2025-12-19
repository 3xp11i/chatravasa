import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event);
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    const client = await serverSupabaseClient(event);
    const query = getQuery(event);

    // Use 'sub' which is the user ID in the JWT
    const userId = user.sub;

    // Get query parameters for filtering and pagination
    const page = parseInt(query.page as string) || 1;
    const pageSize = parseInt(query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    // Get all hostels for the current admin user
    const { data: hostels, error, count } = await client
      .from('hostels')
      .select('*', { count: 'exact' })
      .eq('admin_user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Database error:', error);
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch hostels' });
    }

    return {
      success: true,
      hostels: hostels || [],
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    };
  } catch (error: any) {
    console.error('Error fetching hostels:', error);
    throw error;
  }
});