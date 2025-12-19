import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: "2025-12-18",
	devtools: { enabled: false },

	future: {
		compatibilityVersion: 4,
	},

	modules: [
		"@vite-pwa/nuxt",
		"@nuxtjs/supabase",
		"@nuxt/fonts",
		"@vueuse/nuxt",
	],

	vite: {
		plugins: [tailwindcss()],
	},
	css: ["~/assets/css/main.css", "vue-final-modal/style.css"],

	pwa: {
		registerType: "autoUpdate",
		includeAssets: [
			"favicon.ico",
			"apple-touch-icon-180x180.png",
			"maskable-icon-512x512.png",
		],
		workbox: {
			globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
			navigateFallback: null,
		},
		client: {
			installPrompt: true,
		},
		devOptions: {
			enabled: true,
			type: "module",
			suppressWarnings: true,
			navigateFallback: "/",
		},
		manifest: {
			name: "Chatravasa Management",
			short_name: "Chatravasa",
			description:
				"Chatravasa Management system for hostel residents and staff",
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
	supabase: {
		url: process.env.SUPABASE_URL,
		key: process.env.SUPABASE_KEY,
		types: "@/types/database.types.ts",
		// types: false,
		redirectOptions: {
			login: "/login",
			callback: "/login/callback",
			exclude: ["/", "/login/*"],
		},
	},

	// ---------------------------------------------------------------------------
	// Runtime Config (environment variables)
	// NOTE: Use import.meta.env for Vite compatibility, or define in .env file
	// ---------------------------------------------------------------------------
	runtimeConfig: {
		// Server-only secrets (NOT exposed to client)
		supabaseServiceKey: "",

		// Public keys (exposed to client via useRuntimeConfig().public)
		public: {
			// supabaseUrl: "https://zsiwszrdlapzfmegeqkn.supabase.co",
			// supabaseAnonKey: "",
			// appName: "Chatravasa Management",
		},
	},

	// ---------------------------------------------------------------------------
	// App Head Configuration
	// ---------------------------------------------------------------------------
	app: {
		head: {
			title: "Chatravasa Management",
			meta: [
				{
					name: "description",
					content:
						"Chatravasa Management system for hostel residents and staff",
				},
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ name: "theme-color", content: "#4CAF50" },
			],
			link: [
				{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
				{
					rel: "apple-touch-icon",
					href: "/apple-touch-icon-180x180.png",
					sizes: "180x180",
				},
				{ rel: "manifest", href: "/manifest.webmanifest" },
			],
		},
	},

	fonts: {
		defaults: {
			weights: [400],
			styles: ["normal", "italic"],
			subsets: [
				"cyrillic-ext",
				"cyrillic",
				"greek-ext",
				"greek",
				"vietnamese",
				"latin-ext",
				"latin",
			],
		},
	},
});
