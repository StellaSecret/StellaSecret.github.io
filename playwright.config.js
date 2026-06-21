// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    // Neutral locale so tests aren't affected by runner language
    locale: 'fr-FR',
    colorScheme: 'dark',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],

  // Local dev: spin up a static server automatically
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npx serve public/ -p 8080',
        url: 'http://localhost:8080',
        reuseExistingServer: !process.env.CI,
        timeout: 10000,
      },
});
