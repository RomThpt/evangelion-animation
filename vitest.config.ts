import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: [
      { find: "@/registry", replacement: path.resolve(__dirname, "./registry") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
});
