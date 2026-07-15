import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Mirrors the `@/*` -> project-root path mapping in tsconfig.json.
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // `server-only` throws outside the `react-server` condition (which Vitest
      // doesn't set) — see test/stubs/server-only.ts for why this alias exists.
      "server-only": fileURLToPath(new URL("./test/stubs/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
  },
});
