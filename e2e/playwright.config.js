// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const API_PORT = 4100;
const UI_PORT = 4300;

module.exports = defineConfig({
  testDir: './tests',
  // The tests share one seeded database, so they run in order
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: `http://localhost:${UI_PORT}`,
    trace: 'retain-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: [
    {
      command: 'mix phx.server',
      cwd: '../api',
      env: {
        MIX_ENV: 'dev',
        PORT: String(API_PORT),
        POSTGRES_DB: 'prison_rideshare_e2e',
      },
      url: `http://localhost:${API_PORT}/gas-prices`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      // Expects a build from `pnpm build:ui`, which points at API_PORT
      command: `pnpm exec sirv ../ui/dist --single --port ${UI_PORT}`,
      url: `http://localhost:${UI_PORT}`,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
