# Manav Boys Hostel - Meal Management App

A Progressive Web App (PWA) for managing daily meals at Manav Boys Hostel. Built with Nuxt 4, Tailwind CSS, and Supabase.

## 🏗️ Project Scaffold Status

This is a **scaffold** with placeholder files and comments. Business logic is not yet implemented.

### Features (Planned)
- **Residents**: Toggle meals on/off for today and future days
- **Cook**: View aggregated meal counts for the day
- **Owner**: Manage residents, override meal selections, view analytics

### Tech Stack
- **Frontend**: Nuxt 4 (Vue 3), Tailwind CSS
- **Backend**: Nuxt Server Routes (API)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with Google OAuth
- **PWA**: @vite-pwa/nuxt

## 📁 Directory Structure

```
manav-meals-nuxt/
├── nuxt.config.ts          # Main config (PWA, Supabase placeholders)
├── .env.example            # Environment variables template
├── DEV_NOTES.md            # Implementation notes and TODOs
├── app/
│   ├── app.vue             # Root component
│   ├── assets/css/         # Global styles (Tailwind)
│   ├── components/         # Vue components
│   │   ├── auth/           # AccessCodeForm, GoogleLoginButton, LogoutButton
│   │   ├── resident/       # MealToggle, WeeklyPlanner, ProfileForm
│   │   ├── cook/           # MealStatsCard
│   │   ├── owner/          # AddResidentForm, ResidentListItem
│   │   └── ui/             # HeaderBar, InstallPwaButton
│   ├── composables/        # useAuth, useProfile, useMeals, etc.
│   ├── layouts/            # default, resident, cook, owner
│   ├── middleware/         # auth.global, role-based guards
│   └── pages/              # File-based routing
└── server/
    ├── api/                # API endpoints
    └── utils/              # Server helpers
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Fill in your Supabase credentials in `.env`

4. Start development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📝 Next Steps

See `DEV_NOTES.md` for detailed implementation notes. Priority order:

1. Set up Supabase project and create database tables
2. Implement access code validation API
3. Implement Google OAuth flow
4. Build resident meal toggle UI
5. Build cook dashboard
6. Build owner admin panel
7. Add offline support

## 📄 License

Private project for Manav Boys Hostel.


# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
