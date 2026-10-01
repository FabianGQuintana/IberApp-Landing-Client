import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3005);

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/.results",
  fullyParallel: true,
  workers: 3,
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
  },
  // Reuses a running `npm run dev -- -p 3005`; otherwise starts one.
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
