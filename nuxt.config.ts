// FILE: nuxt.config.ts
// PURPOSE: Main Nuxt 4 configuration file for Manav Boys Hostel Meal Management app.
// INCLUDES: PWA config (already set), Tailwind CSS, and placeholders for Supabase integration.
// TODO: Add Supabase module when implementing auth and database features.

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	// ---------------------------------------------------------------------------
	// Nuxt 4 Compatibility
	// ---------------------------------------------------------------------------
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },

	// Nuxt 4 future flags
	future: {
		compatibilityVersion: 4,
	},

	// ---------------------------------------------------------------------------
	// Modules
	// TODO: Add @nuxtjs/supabase when implementing authentication
	// ---------------------------------------------------------------------------
	modules: ["@vite-pwa/nuxt", "@nuxtjs/supabase"],

	// ---------------------------------------------------------------------------
	// Vite Plugins (Tailwind CSS)
	// ---------------------------------------------------------------------------
	vite: {
		plugins: [tailwindcss()],
	},

	// ---------------------------------------------------------------------------
	// Global CSS
	// ---------------------------------------------------------------------------
	css: ["~/assets/css/main.css"],

	// ---------------------------------------------------------------------------
	// PWA Configuration (already configured)
	// ---------------------------------------------------------------------------
	pwa: {
		registerType: "autoUpdate",
		workbox: {
			// TODO: Add custom caching strategies for API routes and assets
			// globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
		},
		devOptions: {
			enabled: false, // Disable SW in dev to avoid weird reloads
			type: "module",
		},
		manifest: {
			name: "Manav Boys Hostel - Meals App",
			short_name: "Manav Meals",
			description:
				"Meals management app for Manav Boys Hostel residents, cook, and owner",
			theme_color: "#4CAF50",
			background_color: "#ffffff",
			display: "standalone",
			start_url: "/",
			scope: "/",
			icons: [
				{
					src: "pwa-64x64.png",
					sizes: "64x64",
					type: "image/png",
				},
				{
					src: "pwa-192x192.png",
					sizes: "192x192",
					type: "image/png",
				},
				{
					src: "pwa-512x512.png",
					sizes: "512x512",
					type: "image/png",
				},
				{
					src: "maskable-icon-512x512.png",
					sizes: "512x512",
					type: "image/png",
					purpose: "maskable",
				},
			],
		},
	},

	// ---------------------------------------------------------------------------
	// Supabase Configuration (placeholder)
	// TODO: Uncomment after installing @nuxtjs/supabase
	// ---------------------------------------------------------------------------
	// supabase: {
	//   url: process.env.SUPABASE_URL,
	//   key: process.env.SUPABASE_ANON_KEY,
	//   redirectOptions: {
	//     login: '/login',
	//     callback: '/login/google',
	//     exclude: ['/', '/login/*'],
	//   },
	// },

	// ---------------------------------------------------------------------------
	// Runtime Config (environment variables)
	// NOTE: Use import.meta.env for Vite compatibility, or define in .env file
	// ---------------------------------------------------------------------------
	runtimeConfig: {
		// Server-only secrets (NOT exposed to client)
		supabaseServiceKey: "",

		// Public keys (exposed to client via useRuntimeConfig().public)
		public: {
			supabaseUrl: "",
			supabaseAnonKey: "",
			appName: "Manav Boys Hostel Meals",
		},
	},

	// ---------------------------------------------------------------------------
	// App Head Configuration
	// ---------------------------------------------------------------------------
	app: {
		head: {
			title: "Manav Boys Hostel - Meal Management",
			meta: [
				{
					name: "description",
					content: "Meal management system for Manav Boys Hostel residents",
				},
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ name: "theme-color", content: "#4CAF50" },
			],
			link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
		},
	},
});
