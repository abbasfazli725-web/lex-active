import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests",
  use: {
    baseURL: "http://127.0.0.1:5173",
    ...devices["iPhone 13"],
    defaultBrowserType: "chromium",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command: process.env.TEST_PRODUCTION
      ? "npm run preview -- --port 5173"
      : "npm run dev -- --port 5173",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
  },
});
