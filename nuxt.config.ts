import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: "2025-12-18",
	devtools: { enabled: false },
	ssr: false,

	future: {
		compatibilityVersion: 4,
	},

	modules: [
		"@vite-pwa/nuxt",
		"@nuxtjs/supabase",
		"@nuxt/fonts",
		"@vueuse/nuxt",
		"@pinia/nuxt",
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
			maximumFileSizeToCacheInBytes: 3000000,
			globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
			navigateFallback: "/",
			navigateFallbackDenylist: [/^\/api\//],
			runtimeCaching: [
				{
					urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
					handler: "NetworkFirst",
					options: {
						cacheName: "supabase-api-cache",
						expiration: {
							maxEntries: 50,
							maxAgeSeconds: 5 * 60, // 5 minutes
						},
						cacheableResponse: {
							statuses: [0, 200],
						},
					},
				},
				{
					urlPattern: /^\/api\/.*/i,
					handler: "NetworkFirst",
					options: {
						cacheName: "api-cache",
						expiration: {
							maxEntries: 50,
							maxAgeSeconds: 5 * 60, // 5 minutes
						},
						networkTimeoutSeconds: 10,
					},
				},
			],
		},
		client: {
			installPrompt: true,
			periodicSyncForUpdates: 3600, // Check for updates every hour
		},
		devOptions: {
			enabled: true,
			type: "module",
			suppressWarnings: true,
			navigateFallback: "/",
		},
		manifest: {
			name: "Chatravasa - Students ka Ghar, Digitally Managed",
			short_name: "Chatravasa",
			description:
				"Chatravasa Management system for hostel residents and staff",
			theme_color: "#4CAF50",
			background_color: "#FFEE91",
			display: "standalone",
			start_url: "/",
			scope: "/",
			icons: [
				{
					src: "pwa-64x64.png",
					sizes: "64x64",
					type: "image/png",
					purpose: "any",
				},
				{
					src: "pwa-192x192.png",
					sizes: "192x192",
					type: "image/png",
					purpose: "any",
				},
				{
					src: "pwa-512x512.png",
					sizes: "512x512",
					type: "image/png",
					purpose: "any",
				},
				{
					src: "maskable-icon-512x512.png",
					sizes: "512x512",
					type: "image/png",
					purpose: "any maskable",
				},
			],
		},
	},

	// ---------------------------------------------------------------------------
	// Supabase Configuration
	// NOTE: Do NOT inline env values here; Netlify will treat them as leaked
	// secrets. Rely on Netlify environment variables instead.
	// ---------------------------------------------------------------------------
	supabase: {
		types: "@/types/database.types.ts",
		// types: false,
		redirectOptions: {
			login: "/login",
			callback: "/login/callback",
			exclude: ["/", "/login/*", "/contact"],
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
			// supabaseUrl: "",
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
