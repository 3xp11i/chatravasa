/**
 * Composable for managing staff context and permissions
 * Fetches current staff member's details, role, and permissions
 * Uses useState for shared state across all components
 */

export interface StaffPermissions {
  view_residents: boolean;
  manage_residents: boolean;
  view_meals: boolean;
  manage_meals: boolean;
  view_fees: boolean;
  manage_fees: boolean;
  view_complaints: boolean;
  manage_complaints: boolean;
}

export interface StaffRole {
  id: string;
  title: string;
  hostel_id: string;
  hostel_slug: string;
  permissions: StaffPermissions;
}

export interface StaffHostelAssignment {
  hostel_id: string;
  hostel_slug: string;
  hostel_name?: string;
  role: StaffRole;
}

export interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar: string | null;
}

export interface StaffContext {
  member: StaffMember | null;
  role: StaffRole | null;
  hostels: string[]; // List of hostel IDs where staff member works
  permissions: StaffPermissions | null;
  currentHostelId: string | null;
  assignments: StaffHostelAssignment[];
}

const defaultContext: StaffContext = {
  member: null,
  role: null,
  hostels: [],
  permissions: null,
  currentHostelId: null,
  assignments: [],
};

export const useStaffContext = () => {
  const user = useSupabaseUser();
  
  // Use useState for shared state across all components - prevents refetching
  const staffContext = useState<StaffContext>('staff-context', () => ({ ...defaultContext }));
  const loading = useState<boolean>('staff-context-loading', () => false);
  const error = useState<string>('staff-context-error', () => '');
  const hasFetched = useState<boolean>('staff-context-fetched', () => false);

  /**
   * Fetch staff member's details, their roles, and permissions
   * Only fetches if not already loaded (or force = true)
   */
  const fetchStaffContext = async (force = false) => {
    // Skip if already fetched and not forcing refresh
    if (hasFetched.value && !force) {
      return;
    }

    // Get userId from user ref first, then try session as fallback
    let userId = user.value?.id || (user.value as any)?.sub || (user.value as any)?.user?.id;
    
    // If user ref is not ready, try to get from session directly
    if (!userId) {
      const supabase = useSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      userId = session?.user?.id;
    }
    
    if (!userId) {
      return;
    }

    loading.value = true;
    error.value = '';

    try {
      const supabase = useSupabaseClient();

      // Get staff member's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone, avatar')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        error.value = 'Failed to fetch profile';
        return;
      }

      // Get all staff assignments for this user
      const { data: staffAssignments, error: staffError } = await supabase
        .from('hostel_staff')
        .select(`
          id,
          role_id,
          hostel_staff_roles (
            id,
            title,
            hostel_id,
            view_residents,
            manage_residents,
            view_meals,
            manage_meals,
            view_fees,
            manage_fees,
            view_complaints,
            manage_complaints
          )
        `)
        .eq('staff_member_id', userId);

      if (staffError || !staffAssignments || staffAssignments.length === 0) {
        error.value = 'Not a staff member or no assignments found';
        hasFetched.value = true;
        return;
      }

      // Extract unique hostels where staff member works
      const hostels = Array.from(
        new Set(
          staffAssignments
            .filter((s: any) => s.hostel_staff_roles)
            .map((s: any) => s.hostel_staff_roles.hostel_id)
        )
      ) as string[];

      // Use the first role as current
      const firstAssignment = staffAssignments[0] as any;
      const role = firstAssignment.hostel_staff_roles;

      if (!role) {
        error.value = 'Staff role data not accessible';
        hasFetched.value = true;
        return;
      }

      // Fetch hostel slugs for all assigned hostels
      const { data: hostelData, error: hostelError } = await supabase
        .from('hostels')
        .select('id, hostel_slug, hostel_name')
        .in('id', hostels);

      // Create a mapping of hostel_id to hostel_slug
      const slugMap: Record<string, string> = {};
      const nameMap: Record<string, string> = {};
      for (const h of hostelData || []) {
        slugMap[h.id] = h.hostel_slug;
        nameMap[h.id] = h.hostel_name;
      }

      // Build full assignments list for multi-hostel support
      const assignments: StaffHostelAssignment[] = staffAssignments
        .filter((s: any) => !!s.hostel_staff_roles)
        .map((s: any) => {
          const r = s.hostel_staff_roles;
          const slug = slugMap[r.hostel_id] || '';
          return {
            hostel_id: r.hostel_id,
            hostel_slug: slug,
            hostel_name: nameMap[r.hostel_id] || '',
            role: {
              id: r.id,
              title: r.title,
              hostel_id: r.hostel_id,
              hostel_slug: slug,
              permissions: {
                view_residents: r.view_residents,
                manage_residents: r.manage_residents,
                view_meals: r.view_meals,
                manage_meals: r.manage_meals,
                view_fees: r.view_fees,
                manage_fees: r.manage_fees,
                view_complaints: r.view_complaints,
                manage_complaints: r.manage_complaints,
              },
            },
          } as StaffHostelAssignment;
        });

      staffContext.value = {
        member: {
          id: profile.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          avatar: profile.avatar,
        },
        role: {
          id: role.id,
          title: role.title,
          hostel_id: role.hostel_id,
          hostel_slug: slugMap[role.hostel_id] || '',
          permissions: {
            view_residents: role.view_residents,
            manage_residents: role.manage_residents,
            view_meals: role.view_meals,
            manage_meals: role.manage_meals,
            view_fees: role.view_fees,
            manage_fees: role.manage_fees,
            view_complaints: role.view_complaints,
            manage_complaints: role.manage_complaints,
          },
        },
        hostels,
        currentHostelId: role.hostel_id,
        assignments,
        permissions: {
          view_residents: role.view_residents,
          manage_residents: role.manage_residents,
          view_meals: role.view_meals,
          manage_meals: role.manage_meals,
          view_fees: role.view_fees,
          manage_fees: role.manage_fees,
          view_complaints: role.view_complaints,
          manage_complaints: role.manage_complaints,
        },
      };
      hasFetched.value = true;
    } catch (err: any) {
      error.value = 'Failed to load staff context';
      hasFetched.value = true;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Check if staff member has a specific permission
   */
  const hasPermission = (permission: keyof StaffPermissions): boolean => {
    if (!staffContext.value.permissions) return false;
    return staffContext.value.permissions[permission] ?? false;
  };

  /**
   * Check if staff member can view a resource
   */
  const canView = (resource: 'residents' | 'meals' | 'fees' | 'complaints'): boolean => {
    return hasPermission(`view_${resource}` as keyof StaffPermissions);
  };

  /**
   * Check if staff member can manage a resource
   */
  const canManage = (resource: 'residents' | 'meals' | 'fees' | 'complaints'): boolean => {
    return hasPermission(`manage_${resource}` as keyof StaffPermissions);
  };

  // Permissions for a specific hostel slug (multi-hostel support)
  const getAssignmentBySlug = (slug: string): StaffHostelAssignment | null => {
    const a = staffContext.value.assignments.find(a => a.hostel_slug === slug);
    return a || null;
  };

  const canViewForHostel = (slug: string, resource: 'residents' | 'meals' | 'fees' | 'complaints'): boolean => {
    const a = getAssignmentBySlug(slug);
    if (!a) return false;
    return a.role.permissions[`view_${resource}` as keyof StaffPermissions] ?? false;
  };

  const canManageForHostel = (slug: string, resource: 'residents' | 'meals' | 'fees' | 'complaints'): boolean => {
    const a = getAssignmentBySlug(slug);
    if (!a) return false;
    return a.role.permissions[`manage_${resource}` as keyof StaffPermissions] ?? false;
  };

  // Activate role for a given hostel by slug
  const activateHostelBySlug = (slug: string) => {
    const a = getAssignmentBySlug(slug);
    if (!a) return;
    staffContext.value.role = a.role;
    staffContext.value.currentHostelId = a.hostel_id;
    staffContext.value.permissions = a.role.permissions;
  };

  /**
   * Check if user is staff member (has valid staff context)
   */
  const isStaff = computed(() => {
    return staffContext.value.member !== null && staffContext.value.role !== null;
  });

  /**
   * Get staff member full name
   */
  const fullName = computed(() => {
    if (!staffContext.value.member) return '';
    return `${staffContext.value.member.first_name} ${staffContext.value.member.last_name}`;
  });

  /**
   * Clear the staff context (e.g., on logout)
   */
  const clearStaffContext = () => {
    staffContext.value = { ...defaultContext };
    hasFetched.value = false;
    error.value = '';
  };

  // Only watch for user changes to handle login/logout
  // The actual fetch is controlled by hasFetched flag
  watch(user, (newUser, oldUser) => {
    if (!newUser && oldUser) {
      // User logged out - clear context
      clearStaffContext();
    } else if (newUser && !oldUser) {
      // User logged in - fetch if not already fetched
      fetchStaffContext();
    }
  });

  return {
    staffContext: readonly(staffContext),
    loading: readonly(loading),
    error: readonly(error),
    hasPermission,
    canView,
    canManage,
    getAssignmentBySlug,
    canViewForHostel,
    canManageForHostel,
    activateHostelBySlug,
    isStaff,
    fullName,
    fetchStaffContext,
    clearStaffContext,
  };
};
