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
		"@nuxt/icon",
		"@nuxt/image",
		"@nuxtjs/i18n",
	],

	vite: {
		plugins: [tailwindcss()],
		server: {
			allowedHosts: [".ngrok-free.app"],
		},
	},
	css: ["~/assets/css/main.css", "vue-final-modal/style.css"],

	pwa: {
		registerType: "autoUpdate",
		includeAssets: [
			"favicon.ico",
			"apple-touch-icon-180x180.png",
			"maskable-icon-512x512.png",
		],
		// Import custom push handler into the service worker
		injectManifest: {
			globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
		},
		workbox: {
			maximumFileSizeToCacheInBytes: 3000000,
			globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
			navigateFallback: "/",
			navigateFallbackDenylist: [/^\/api\//],
			// Import the push notification handler
			importScripts: ["/sw-push.js"],
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

	supabase: {
		types: "@/types/database.types.ts",
		// types: false,
		redirectOptions: {
			login: "/login",
			callback: "/login/callback",
			exclude: ["/", "/login/*", "/contact"],
		},
		clientOptions: {
			auth: {
				persistSession: true,
			},
		},
	},

	// ---------------------------------------------------------------------------
	// Runtime Config (environment variables)
	// NOTE: Use import.meta.env for Vite compatibility, or define in .env file
	// ---------------------------------------------------------------------------
	runtimeConfig: {
		// Server-only secrets (NOT exposed to client)
		supabaseServiceKey: "",
		// VAPID private key for push notifications (server-only)
		vapidPrivateKey: process.env.NUXT_VAPID_PRIVATE_KEY || "",
		// VAPID subject for push notifications (server-only)
		vapidSubject: process.env.NUXT_VAPID_SUBJECT || "mailto:admin@chatravasa.com",

		// Public keys (exposed to client via useRuntimeConfig().public)
		public: {
			// supabaseUrl: "",
			// supabaseAnonKey: "",
			// appName: "Chatravasa Management",
			// VAPID public key for push notifications (exposed to client)
			vapidPublicKey: process.env.NUXT_PUBLIC_VAPID_PUBLIC_KEY || "",
		},
	},

	app: {
		head: {
			title: "Chatravasa - Students ka Ghar, Digitally Managed",
			meta: [
				{
					name: "description",
					content:
						"Chatravasa Management system for hostel residents and staff",
				},
				{ name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, shrink-to-fit=no" },
			{ name: "HandheldFriendly", content: "true" },
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
	i18n: {
		// langDir: '~/i18n/locales/',
		strategy: 'no_prefix',
		defaultLocale: "en",
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: 'locale',
			alwaysRedirect: false,
			fallbackLocale: 'en'
		},
		locales: [
			{ code: "en", name: "English", file: "en.json" },
			{ code: "hi", name: "Hindi", file: "hi.json" },
		],
	},
});
