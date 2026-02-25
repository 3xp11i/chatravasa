import { getAuthUser, getAuthenticatedClient } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Use custom auth utility that supports both Authorization header (Capacitor) and cookies (web)
    const user = await getAuthUser(event);
    if (!user) {
      console.log('[get-hostels] No authenticated user found');
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    const client = await getAuthenticatedClient(event);
    const query = getQuery(event);

    // Use 'sub' which is the user ID in the JWT
    const userId = user.sub || user.id;
    console.log('[get-hostels] User authenticated:', userId);

    // Get query parameters for filtering and pagination
    const page = parseInt(query.page as string) || 1;
    const pageSize = parseInt(query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    // Determine if user is an admin
    const { data: adminRow } = await client
      .from('admins')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    let hostels: any[] = [];
    let count: number | null = null;
    let error: any = null;

    if (adminRow) {
      // Admin: fetch hostels owned by admin
      const res = await client
        .from('hostels')
        .select('*', { count: 'exact' })
        .eq('admin_user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);
      hostels = res.data || [];
      count = res.count || 0;
      error = res.error;
    } else {
      // Staff: fetch hostels through their role assignments and join to hostels
      const { data: staffHostels, error: staffErr } = await client
        .from('hostel_staff')
        .select(`
          id,
          hostel_staff_roles (
            hostel_id,
            hostels (
              id,
              hostel_slug,
              hostel_name,
              address,
              total_rooms,
              available_rooms,
              created_at,
              admin_user_id
            )
          )
        `)
        .eq('staff_member_id', userId);

      if (staffErr) {
        error = staffErr;
      } else {
        // Flatten and dedupe hostels
        const flat: any[] = [];
        for (const row of staffHostels || []) {
          const h = row?.hostel_staff_roles?.hostels;
          if (h) flat.push(h);
        }
        const map = new Map<string, any>();
        for (const h of flat) {
          map.set(h.id, h);
        }
        const allHostels = Array.from(map.values());

        count = allHostels.length;
        hostels = allHostels
          .sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
          .slice(offset, offset + pageSize);
      }
    }

    if (error) {
      console.error('Database error:', error);
      throw createError({ statusCode: 500, statusMessage: 'Failed to fetch hostels' });
    }

    return {
      success: true,
      isAdmin: !!adminRow,
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