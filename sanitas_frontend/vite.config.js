import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: "/src",
    },
  },
  define: {
    "process.env": process.env,
  },
  test: {
    environment: "jsdom",
    setupFiles: "UITestSetup.js",
  },
});
