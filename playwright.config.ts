import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
const chromiumPath = process.env.CHROMIUM_PATH ?? "/usr/bin/chromium";
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: "http://127.0.0.1:3000",
    viewport: { width: 1505, height: 1045 },
    launchOptions: {
      ...(existsSync(chromiumPath) ? { executablePath: chromiumPath } : {}),
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
  },
});
