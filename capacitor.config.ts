import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: "com.chatravasa.management",
	appName: "Chatravasa",
	webDir: ".output/public",
	server: {
		// Use https scheme for local files (required for some APIs like cookies)
		androidScheme: "https",
		// Allows Capacitor app to make requests to your API
		allowNavigation: [
			"dev.app.chatravasa.com",
			"app.chatravasa.com",
			"*.chatravasa.com",
			"*.supabase.co",
		],

		// url: "http://192.168.1.7:3000",
		// cleartext: true,
	},
	android: {
		allowMixedContent: false,
		captureInput: true,
		webContentsDebuggingEnabled: true, // Set to false for production release
	},
	plugins: {
		SplashScreen: {
			launchShowDuration: 2000,
			backgroundColor: "#FFEE91",
			androidSplashResourceName: "splash",
			androidScaleType: "CENTER_CROP",
			showSpinner: false,
			androidSpinnerStyle: "large",
			spinnerColor: "#4CAF50",
		},
		PushNotifications: {
			presentationOptions: ["badge", "sound", "alert"],
		},
		StatusBar: {
			style: "dark",
			backgroundColor: "#4CAF50",
		},
	},
};

export default config;
