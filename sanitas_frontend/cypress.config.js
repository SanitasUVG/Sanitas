import { defineConfig } from "cypress";

export default defineConfig({
	watchForFileChanges: false,
	e2e: {
		setupNodeEvents(_on, _config) {
			// implement node event listeners here
		},
	},
});
