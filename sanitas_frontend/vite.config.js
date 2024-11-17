import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			src: "/src",
			// NOTE: AWS Cognito library needs this to run on release.
			...(process.env.NODE_ENV !== "development"
				? {
						"./runtimeConfig": "./runtimeConfig.browser",
					}
				: {}),
		},
	},
	define: {
		"process.env": process.env,
		// NOTE: AWS Cognito library needs this to run on development.
		...(process.env.NODE_ENV === "development" ? { global: {} } : {}),
	},
	test: {
		environment: "jsdom",
		setupFiles: "UITestSetup.js",
	},
});
