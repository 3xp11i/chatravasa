# DEV_NOTES.md - Manav Boys Hostel Meal Management

## Critical Areas to Implement

### 1. Authentication & Access Code Flow
- [ ] **Access Code Generation**: Owner creates resident with phone + generates unique 6-digit code
- [ ] **Access Code Validation**: Resident enters phone + code → validates against DB
- [ ] **Google OAuth Linking**: After code validation, redirect to Google sign-in
- [ ] **User-Profile Linking**: Link Google auth user ID to resident profile in DB
- [ ] **Session Management**: Use Supabase Auth or custom JWT tokens

### 2. Role-Based Access Control
- **Roles**: `resident`, `cook`, `owner`
- [ ] Store role in user profile table
- [ ] Middleware checks role before allowing route access
- [ ] API routes must also verify role server-side

### 3. Database Schema (Supabase)
```sql
-- TODO: Create these tables in Supabase

-- profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  phone TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  room_number TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'resident', -- 'resident' | 'cook' | 'owner'
  access_code TEXT, -- 6-digit code for initial linking
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- meal_plans (daily meal selections)
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  breakfast BOOLEAN DEFAULT TRUE,
  lunch BOOLEAN DEFAULT TRUE,
  dinner BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- audit_log (for owner overrides)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES profiles(id),
  performed_by UUID REFERENCES profiles(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. API Endpoints to Implement
| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/validate-access-code` | POST | Validate phone + access code | No |
| `/api/link-user` | POST | Link OAuth user to profile | Yes |
| `/api/owner-add-resident` | POST | Add new resident | Owner only |
| `/api/meals-update` | POST | Update meal selections | Resident/Cook |
| `/api/owner-override` | POST | Override any resident's meal | Owner only |
| `/api/stats` | GET | Get meal counts for dashboard | Cook/Owner |

### 5. Meal Logic Rules
- Residents can toggle meals for **today** (before cutoff time) and **future days**
- Cutoff times (configurable):
  - Breakfast: 7:00 AM
  - Lunch: 11:00 AM  
  - Dinner: 6:00 PM
- Past days are read-only
- Cook sees aggregated counts, not individual selections

### 6. PWA Features
- [x] Basic PWA config (manifest, icons)
- [ ] Offline support for viewing current meal plan
- [ ] Push notifications for meal reminders (optional)
- [ ] Install prompt UI

### 7. UI/UX Priorities
- Mobile-first design (most users on phones)
- Large touch targets for meal toggles
- Clear visual feedback for on/off states
- Simple navigation between days

---

## File Structure Reference

```
manav-meals-nuxt/
├── nuxt.config.ts          # Main config (PWA, Supabase, etc.)
├── .env                    # Environment variables (secrets)
├── app/
│   ├── app.vue             # Root component
│   ├── assets/css/         # Global styles
│   ├── components/         # Vue components by feature
│   │   ├── auth/           # Login, access code forms
│   │   ├── resident/       # Meal toggles, planner
│   │   ├── cook/           # Stats cards
│   │   ├── owner/          # Admin forms
│   │   └── ui/             # Shared UI components
│   ├── composables/        # Shared logic (useAuth, useMeals, etc.)
│   ├── layouts/            # Page layouts by role
│   ├── middleware/         # Route guards
│   └── pages/              # File-based routing
└── server/
    ├── api/                # API route handlers
    └── utils/              # Server-side helpers
```

---

## Next Steps (Priority Order)

1. **Set up Supabase project** and create tables
2. **Implement `/api/validate-access-code`** endpoint
3. **Implement Google OAuth** with Supabase Auth
4. **Implement `/api/link-user`** to connect auth to profile
5. **Build resident meal toggle UI** with real data
6. **Build cook dashboard** with live stats
7. **Build owner admin panel** for managing residents
8. **Add offline support** and push notifications

---

## Environment Variables Needed

See `.env.example` for required variables.
